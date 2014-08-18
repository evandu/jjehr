# coding=utf-8
from Crypto.Cipher import AES
import base64
from JJEhr import settings


def AESEncrypt(text):
    BS = AES.block_size
    pad = lambda s: s + (BS - len(s) % BS) * chr(BS - len(s) % BS)
    cipher = AES.new(settings.AES_KEY)
    encrypted = cipher.encrypt(pad(text.encode('utf-8')))
    return base64.b64encode(encrypted)


def generate_QRcode(data, dir_name):
    import qrcode
    import Image
    import os
    import uuid
    import tools

    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=1
    )
    qr.add_data(tools.AESEncrypt(data))
    qr.make(fit=True)
    img = qr.make_image()
    img = img.convert("RGBA")
    icon = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icon.png'))
    img_w, img_h = img.size
    factor = 4
    size_w = int(img_w / factor)
    size_h = int(img_h / factor)
    icon_w, icon_h = icon.size
    if icon_w > size_w:
        icon_w = size_w
    if icon_h > size_h:
        icon_h = size_h
    icon = icon.resize((icon_w, icon_h), Image.ANTIALIAS)
    w = int((img_w - icon_w) / 2)
    h = int((img_h - icon_h) / 2)
    img.paste(icon, (w, h), icon)
    qr_code_path = os.path.join(settings.QRcode_path, dir_name)
    if not os.path.exists(qr_code_path):
        os.mkdir(qr_code_path)
    name = os.path.join(qr_code_path, str(uuid.uuid1()) + ".png")
    img.save(name)
    return name


def send_mail(course, enroll, qr_code_path):
    from django.core.mail import EmailMultiAlternatives
    from email.MIMEImage import MIMEImage
    import uuid

    attch_name = str(uuid.uuid1()) + ".png"
    subject, from_email, to = settings.ENROLL_EMAIL_SUBJECT.format(
        name=course.courseName), settings.ENROLL_EMAIL_FROM, enroll.email
    text_content = settings.ENROLL_EMAIL_CONTENT.format(name=course.courseName)
    html_content = course.event_type.type_template.format(
        name=course.courseName, seat=enroll.seat, image=attch_name,
        courseTime=course.courseStartTime.strftime('%d/%m/%Y %I:%M:%S %p'), email=enroll.email.split("@")[0])
    msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
    msg.attach_alternative(html_content, "text/html")
    msg.mixed_subtype = 'related'
    fp = open(qr_code_path, 'rb')
    msg_img = MIMEImage(fp.read())
    fp.close()
    msg_img.add_header('Content-ID', '<{}>'.format(attch_name))
    msg.attach(msg_img)
    msg.send()