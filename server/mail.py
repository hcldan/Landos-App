
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email import encoders
import json

def send_run_email(run_id, c):
    msg = MIMEMultipart("alternative")

    html = "If you see this message, you need to install the Lando's app gadget from the EE demos section of the gadget catalog."
    
    gadget_url = "http://kargath.notesdev.ibm.com:8080/LandosApp.xml"
    gadget_context = run_id
    data_d = {"gadget" : gadget_url, "context" : gadget_context}
    data = json.dumps(data_d)

    html_part = MIMEText(html, "html")
    ee_part = MIMEApplication(data, "embed+json", encoders.encode_7or8bit)

    msg.attach(html_part)
    msg.attach(ee_part)

    s = smtplib.SMTP("ace.swg.usma.ibm.com")

    c.execute("SELECT email from users")
    results = c.fetchall()

    if not results:
        return
    
    recipients = map(lambda recipient: recipient[0], results)
    
    me = "ddumont@us.ibm.com"
    #you = "roneill@us.ibm.com"
    msg['Subject'] = "Lando's run for Thursday December 13 - Place your order by 11:00 AM"
    msg['From'] = me
    msg['To'] = ", ".join(recipients)
    #msg['To'] = you

    print msg.as_string()
    
    s.sendmail(me, recipients, msg.as_string())

    s.quit()
