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
    def initial_facts(self):
        while True:
            try:
                income = int(input("Enter your monthly income: "))
                break
            except ValueError:
                print("Please enter a valid integer for your income.")
        
        yield Fact(income=income)
        yield Fact(expenses_entered=0)  # Initialize counter for entered expenses
        for category, items in expenses.items():
            for expense, priority in items.items():
                yield Fact(expense=expense, category=category, priority=priority, amount=0)

    @Rule(Fact(expense=MATCH.e, category=MATCH.c, priority=MATCH.p, amount=0))
    def ask_expense_amount(self, e, c, p):
        answer = input(f"Did you spend money on {e}? (yes/no): ")
        if answer.lower() == "yes":
            self.declare(Fact(acknowledged_expense=e))
        else:
            self.declare(Fact(expense_skipped=e))

    @Rule(Fact(acknowledged_expense=MATCH.e))
    def prompt_expense_amount(self, e):
        amount_str = input(f"Enter amount spent on {e}: ")
        self.declare(Fact(amount_entered=e, amount_str=amount_str))

    @Rule(Fact(amount_entered=MATCH.e, amount_str=MATCH.a_str))
    def validate_expense_amount(self, e, a_str):
        try:
            amount = int(a_str)
            self.declare(Fact(validated_expense=e, amount=amount))
        except ValueError:
            print("Please enter a valid integer for the amount.")
            self.retract(Fact(amount_entered=e, amount_str=a_str))
            self.declare(Fact(acknowledged_expense=e))

    @Rule(Fact(validated_expense=MATCH.e, amount=MATCH.a))
    def update_expense_amount(self, e, a):
        for fact in self.facts.values():
            if fact.get('expense') == e:
                self.modify(fact, amount=a)
                break
        self.increment_expenses_entered()

    @Rule(Fact(expense_skipped=MATCH.e))
    def increment_skipped_expense(self, e):
        self.increment_expenses_entered()

    def increment_expenses_entered(self):
        self.expenses_entered += 1
        self.modify(self.facts[self.facts.keys()[0]], expenses_entered=self.expenses_entered)


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
                    if reduction > 0:
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