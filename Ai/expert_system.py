from experta import *

# Define expense categories and priorities
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
    def initial_facts(self):
        while True:
            try:
                income = int(input("Enter your monthly income: "))
                break
            except ValueError:
                print("Please enter a valid integer for your income.")
        
        yield Fact(income=income)
        for category, items in expenses.items():
            for expense, priority in items.items():
                yield Fact(expense=expense, category=category, priority=priority, amount=0)

    @Rule(Fact(expense=MATCH.e, category=MATCH.c, priority=MATCH.p, amount=0))
    def ask_expense_amount(self, e, c, p):
        answer = input(f"Did you spend money on {e} ({c} priority)? (yes/no): ")
        if answer.lower() == "yes":
            while True:
                try:
                    amount = int(input(f"Enter amount spent on {e}: "))
                    break
                except ValueError:
                    print("Please enter a valid integer for the amount.")
            # Find the fact with the matching expense
            for fact in self.facts.values():
                if fact.get('expense') == e:
                    self.modify(fact, amount=amount)
                    break
            else:
                print(f"Error: Could not find fact for expense '{e}'")

    @Rule(Fact(income=MATCH.i), AS.f << Fact(expense=MATCH.e, amount=MATCH.a))
    def calculate_totals(self, i, f):
        total_expenses = sum(fact['amount'] for fact in self.facts.values() if 'amount' in fact)
        savings = i - total_expenses
        self.declare(Fact(total_expenses=total_expenses, savings=savings))

    @Rule(Fact(savings=MATCH.s), Fact(income=MATCH.i))
    def recommend_plan(self, s, i):
        savings_percent = (s / i) * 100
        if savings_percent >= 20:
            print(f"Your spending habits are good! You're saving {savings_percent:.2f}% of your income.")
            self.print_expense_breakdown(i)
        else:
            print("Your savings are lower than the recommended 20%. We can adjust your spending to achieve this goal.")
            self.adjust_spending(i, s)

    def print_expense_breakdown(self, income):
        total_expenses = sum(fact['amount'] for fact in self.facts.values() if 'amount' in fact)
        for fact in self.facts.values():
            if 'amount' in fact:
                percent = (fact['amount'] / income) * 100
                print(f"{fact['expense']}: {fact['amount']:.2f} ({percent:.2f}%)")
        needs_percent = sum(fact['amount'] for fact in self.facts.values() if fact.get('category') == "Needs") / income * 100
        wants_percent = sum(fact['amount'] for fact in self.facts.values() if fact.get('category') == "Wants") / income * 100
        print(f"Needs: {needs_percent:.2f}%")
        print(f"Wants: {wants_percent:.2f}%")

    def adjust_spending(self, income, current_savings):
        target_savings = income * 0.2  # Aim for 20% savings
        deficit = target_savings - current_savings

        # Iterate through expenses in descending order of priority (Wants -> Needs)
        for category in ["Wants", "Needs"]:
            for fact in sorted(self.facts.values(), key=lambda x: x.get('priority', ''), reverse=True):
                if fact.get('category') == category and deficit > 0:
                    reduction = min(deficit, fact['amount'])  # Reduce by minimum of deficit or expense amount
                    deficit -= reduction
                    new_amount = fact['amount'] - reduction
                    print(f"Suggestion: Reduce spending on {fact['expense']} by {reduction:.2f}. New amount: {new_amount:.2f}")
                    self.modify(fact, amount=new_amount)
                    if deficit <= 0:
                        break

        if deficit > 0:
            print(f"Warning: You're spending more than you need to. You're spending {income - current_savings} while you need to save {target_savings}.")

engine = Budget()
engine.reset()
engine.run()