from experta import *

expenses = {
    "Needs": {
        "Rent/Mortgage": "High",
        "Healthcare": "High",
        "Insurance": "High",
        "Utilities": "High",
        "Food/Groceries": "High",
        "Childcare": "High",
    },
    "Wants": {
        "Transportation": "Medium",
        "Personal Spending": "Medium",
        "Home Goods": "Medium",
        "Clothing": "Medium",
        "Pets": "Medium",
        "Restaurants": "Low",
        "Travel & Entertainment": "Low",
        "Electronics": "Low",
        "Beauty Products": "Low",
        "Services": "Low",
        "Subscriptions": "Low",
    },
}

class Budget(KnowledgeEngine):
    @DefFacts()
    def initial_facts(self, income, expense_dict):
        yield Fact(income=income)
        yield Fact(expenses_entered=len(expense_dict))  # Initialize counter for entered expenses
        for category, items in expenses.items():
            for expense, priority in items.items():
                amount = expense_dict.get(expense, 0)
                yield Fact(expense=expense, category=category, priority=priority, amount=amount)

    @Rule(Fact(income=MATCH.i), Fact(expenses_entered=MATCH.count), TEST(lambda count: count == len(expenses["Needs"]) + len(expenses["Wants"])))
    def calculate_totals(self, i, count):
        total_expenses = sum(fact['amount'] for fact in self.facts.values() if 'amount' in fact)
        savings = i - total_expenses
        self.declare(Fact(total_expenses=total_expenses, savings=savings))

    @Rule(Fact(total_expenses=MATCH.te), Fact(savings=MATCH.s), Fact(income=MATCH.i))
    def recommend_plan(self, te, s, i):
        savings_percent = (s / i) * 100
        if savings_percent >= 20:
            #print(f"Your spending habits are good! You're saving {savings_percent:.2f}% of your income.")
            self.declare(Fact(advice="Your spending habits are good!", savings_percent=savings_percent))
            self.print_expense_breakdown(i)
        else:
            #print("Your savings are lower than the recommended 20%. We can adjust your spending to achieve this goal.")
            self.declare(Fact(advice="Your savings are lower than the recommended 20%", savings_percent=savings_percent))
            self.print_expense_breakdown(i)  # Print breakdown before adjustment
            self.adjust_spending(i, s)
        self.halt()  # Stop the engine after displaying the results

    def print_expense_breakdown(self, income):
        total_expenses = sum(fact['amount'] for fact in self.facts.values() if 'amount' in fact)
        for fact in self.facts.values():
            if 'amount' in fact:
                percent = (fact['amount'] / income) * 100
                #print(f"{fact['expense']}: {fact['amount']:.2f} ({percent:.2f}%)")
        needs_percent = sum(fact['amount'] for fact in self.facts.values() if fact.get('category') == "Needs") / income * 100
        wants_percent = sum(fact['amount'] for fact in self.facts.values() if fact.get('category') == "Wants") / income * 100
        #print(f"Needs: {needs_percent:.2f}%")
        self.declare(Fact(needs = needs_percent))
        #print(f"Wants: {wants_percent:.2f}%")
        self.declare(Fact(wants = wants_percent))

    def adjust_spending(self, income, current_savings):
        target_savings = income * 0.2  # Aim for 20% savings
        deficit = target_savings - current_savings

        # Iterate through expenses in descending order of priority (Wants -> Needs)
        for category in ["Wants", "Needs"]:
            for fact in sorted(self.facts.values(), key=lambda x: x.get('priority', ''), reverse=True):
                if fact.get('category') == category and deficit > 0:
                    reduction = min(deficit, fact['amount'])  # Reduce by minimum of deficit or expense amount
                    if reduction > 0:
                        deficit -= reduction
                        new_amount = fact['amount'] - reduction
                        #print(f"Suggestion: Reduce spending on {fact['expense']} by {reduction:.2f}. New amount: {new_amount:.2f}")
                        self.declare(Fact(advice="Reduce spending", reduction=reduction, new_amount=new_amount, expense=fact['expense']))
                        self.modify(fact, amount=new_amount)
                    if deficit <= 0:
                        break

        if deficit > 0:
            #print(f"Warning: You're spending more than you need to. You're spending {income - current_savings} while you need to save {target_savings}.")
            self.declare(Fact(advice="You're spending more than you need to", deficit=deficit))

def get_budgeting_recommendations(income, expense_dict):
    engine = Budget()
    engine.reset(income=income, expense_dict=expense_dict)  # Pass arguments to reset()
    engine.run()
    return [fact for fact in engine.facts.values() if any(key in fact for key in ['amount', 'advice', 'needs', 'wants'])]

# Example usage




