import pywhatkit as kit
import datetime

# Group ID from WhatsApp Web URL
group_id = "ABCD1234567890abcdef"  # Example ID, replace with your group ID

message = "Hello group! This is an automated message from Python."

# Send message to group
now = datetime.datetime.now()
kit.sendwhatmsg_to_group(group_id, message, now.hour, now.minute + 1)