from typing import Final
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import exp as exp

TOKEN: Final = "7409149643:AAHUKEIdorFs65UdpTAzR1h_rNoR6NzxdKI"
BOT_USERNAME: Final = "@ExpFinanceBot"

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"Hi {update.effective_user.first_name}, I'm your Expenses Bot!")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("""
    /start - Start the bot
    /help - Show this message
    /format - Format your expenses
    """)

async def format_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Edit this to your data and send it back")
    await update.message.reply_text("""
Income: 0,
Rent/Mortgage: 0,
Healthcare: 0,
Insurance: 0,
Utilities: 0,
Food/Groceries: 0,
Childcare: 0,
Transportation: 0,
Personal Spending: 0,
Home Goods: 0,
Clothing: 0,
Pets: 0,
Restaurants: 0,
Travel & Entertainment: 0,
Electronics: 0,
Beauty Products: 0,
Services: 0,
Subscriptions: 0
""")

def handle_res(text: str) -> str:
    data = text.split(",")

    if len(data) < 18:
        return "Please enter your data with given format (/help for more info)"

    income: int = int(data[0].split(":")[1])

    if income <= 0:
        return "Income cannot be zero or negative"
    
    expense_dict = {}
    for item in data[1:]:
        expense, amount = item.split(":")
        expense_dict[expense.strip()] = int(amount)


    recommendations = exp.get_budgeting_recommendations(income, expense_dict)

    res = ""

    for fact in recommendations:
        if fact.get('advice'):
            advice = fact.get('advice')
            if advice == "Your spending habits are good!":
                res += f"Your spending habits are good! You're saving {fact['savings_percent']:.2f}% of your income.\n"
            if advice == "Your savings are lower than the recommended 20%":
                res += f"Your savings are lower than the recommended 20%.\n We can adjust your spending to achieve this goal.\n"
            if advice == "Reduce spending":
                res += f"Suggestion: Reduce spending on {fact['expense']} by {fact['reduction']:.2f}.\n New amount: {fact['new_amount']:.2f}\n"
            if advice == "You're spending more than you need to":
                res += "You're spending more than you need to\n"

        elif fact.get('amount'):
            res += f"{fact['expense']} - {fact['amount']:.2f}\n"
        elif fact.get('needs'):
            res += f"Needs: {fact['needs']:.2f}%\n"
        elif fact.get('wants'):
            res += f"Wants: {fact['wants']:.2f}%\n"
    
    return res

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message_type: str = update.message.chat.type
    text: str = update.message.text

    print(f'User {update.effective_user.first_name}({update.message.chat.id}) in {message_type} : "{text}"')

    if message_type == 'group':
        if BOT_USERNAME in text:
            text = text.replace(BOT_USERNAME, '').strip()
            res: str = handle_res(text)
        else:
            return
    else:
        res: str = handle_res(text)

    print("Bot : ", res)
    await update.message.reply_text(res)

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Log the error and send a telegram message to notify the developer."""
    # Log the error before we do anything else, so we can see it even if something breaks.
    print(f'The {update} error : {context.error}')


if __name__ == '__main__':
    print("Bot started!")
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler('start', start_command))
    app.add_handler(CommandHandler('help', help_command))
    app.add_handler(CommandHandler('format', format_command))

    app.add_handler(MessageHandler(filters.TEXT, handle_message))

    app.add_error_handler(error_handler)

    print("Bot is running!")
    app.run_polling(poll_interval=3)
