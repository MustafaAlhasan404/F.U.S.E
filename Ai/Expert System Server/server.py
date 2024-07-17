from flask import Flask, request, jsonify
from experta import *
import json

app = Flask(__name__)

class Budget(KnowledgeEngine):
    @DefFacts()
    def initial_facts(self, income, expense_dict):
        yield Fact(income=income)
        yield Fact(expenses_entered=len(expense_dict))  # Initialize counter for entered expenses
        for expense, details in expense_dict.items():
            yield Fact(expense=expense, category=details['category'], priority=details['priority'], amount=details['amount'])

    @Rule(Fact(income=MATCH.i), Fact(expenses_entered=MATCH.count), TEST(lambda count: count > 0))
    def calculate_totals(self, i, count):
        total_expenses = sum(fact['amount'] for fact in self.facts.values() if 'amount' in fact)
        savings = i - total_expenses
        self.declare(Fact(total_expenses=total_expenses, savings=savings))

    @Rule(Fact(total_expenses=MATCH.te), Fact(savings=MATCH.s), Fact(income=MATCH.i))
    def recommend_plan(self, te, s, i):
        savings_percent = (s / i) * 100
        if savings_percent >= 20:
            self.declare(Fact(advice="Your spending habits are good!", savings_percent=savings_percent))
            self.print_expense_breakdown(i, te)
        else:
            self.declare(Fact(advice="Your savings are lower than the recommended 20%", savings_percent=savings_percent))
            self.print_expense_breakdown(i, te)  # Print breakdown before adjustment
            self.adjust_spending(i, s)
        self.halt()  # Stop the engine after displaying the results

    def print_expense_breakdown(self, income, total_expenses):
        category_expenses = {}
        for fact in self.facts.values():
            if 'amount' in fact:
                category = fact['category']
                amount = fact['amount']
                if category not in category_expenses:
                    category_expenses[category] = 0
                category_expenses[category] += amount

        for category, amount in category_expenses.items():
            percent = (amount / total_expenses) * 100
            self.declare(Fact(category=category, percent=percent))

    def adjust_spending(self, income, current_savings):
        target_savings = income * 0.2  # Aim for 20% savings
        deficit = target_savings - current_savings

        # Iterate through expenses in descending order of priority
        for fact in sorted(self.facts.values(), key=lambda x: x.get('priority', ''), reverse=True):
            if deficit > 0:
                reduction = min(deficit, fact['amount'])  # Reduce by minimum of deficit or expense amount
                if reduction > 0:
                    deficit -= reduction
                    new_amount = fact['amount'] - reduction
                    self.declare(Fact(advice="Reduce spending", reduction=reduction, new_amount=new_amount, expense=fact['expense']))
                    self.modify(fact, amount=new_amount)
                if deficit <= 0:
                    break

        if deficit > 0:
            self.declare(Fact(advice="You're spending more than you need to", deficit=deficit))

def get_budgeting_recommendations(income, expense_dict):
    engine = Budget()
    engine.reset(income=income, expense_dict=expense_dict)  # Pass arguments to reset()
    engine.run()
    
    print("All Facts:")
    for fact_id, fact in engine.facts.items():
        fact_dict = fact.as_dict()  # Convert the Fact object to a dictionary
        print(f"Fact {fact_id}: {fact_dict}")
        
    return [fact for fact in engine.facts.values() if any(key in fact for key in ['amount', 'advice', 'needs', 'wants', 'percent'])]

@app.route('/budget', methods=['POST'])
def budget():
    data = request.json
    income = data.get('income')
    expenses = data.get('expenses', [])
    
    # Correctly construct the expense_dict
    expense_dict = {expense['category']: {'category': expense['category'], 'amount': expense['amount'], 'priority': expense['priority']} for expense in expenses}
    
    recommendations = get_budgeting_recommendations(income, expense_dict)
    
    expense_breakdowns = []
    advice = []
    
    for fact in recommendations:
        if fact.get('advice'):
            advice_fact = {
                "advice": fact.get('advice')
            }
            if fact.get('advice') == "Your spending habits are good!":
                advice_fact["savings_percent"] = round(fact['savings_percent'], 1)
            elif fact.get('advice') == "Your savings are lower than the recommended 20%":
                advice_fact["savings_percent"] = round(fact['savings_percent'], 1)
            elif fact.get('advice') == "Reduce spending":
                advice_fact.update({
                    "expense": fact['expense'],
                    "reduction": fact['reduction'],
                    "new_amount": fact['new_amount']
                })
            elif fact.get('advice') == "You're spending more than you need to":
                advice_fact["deficit"] = fact['deficit']
            advice.append(advice_fact)
        elif fact.get('percent'):
            expense_breakdowns.append({
                "category": fact['category'],
                "percent": round(fact['percent'], 1)
            })
    
    response = {
        "expense_breakdowns": expense_breakdowns,
        "advice": advice
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
