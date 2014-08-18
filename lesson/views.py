#-*- coding: UTF-8 -*-
import datetime
from django.core.mail import send_mail
from django.shortcuts import render_to_response
from lesson.manager import tempMapping
import settings
from JJEhr.lesson.form import EnrollForm
from JJEhr.lesson.models import Course, Enroll

from django.http import HttpResponse
from django.template.context import RequestContext


def index(httpRequest):
    kwargs = httpRequest.GET
    isSearch = False
    if kwargs.has_key('searchType') and kwargs.has_key('searchContent'):
        current_search_type = tempMapping().getSearchType(kwargs.get('searchType'))
        searchContent = kwargs.get('searchContent')
        isSearch = True
    course_set = Course.search_objects.search(**kwargs)
    allow_course_id = []
    for course in course_set.object_list:
        if course.enrollStartTime < datetime.datetime.now() and course.enrollEndTime > datetime.datetime.now():
            allow_course_id.append(course.id)
    _context = {
        'course_list': course_set,
        'allow_course_id_list': allow_course_id,
        'search_type': tempMapping().getAllSearchType(),
        'isSearch': isSearch,
    }
    if isSearch:
        _context['current_search_type'] = current_search_type
        _context['searchContent'] = searchContent
    return render_to_response('lesson/index.html', _context, context_instance=RequestContext(httpRequest))


def book_course(request):
    if request.method == 'POST':
        form = EnrollForm(request.POST)
        if form.is_valid():
            _email = form._raw_value('email')
            _course = Course.objects.get(id=form._raw_value("course_id"))
            if _course.enrollStartTime > datetime.datetime.now() or _course.enrollEndTime < datetime.datetime.now():
                return HttpResponse(404)
            if Enroll.objects.filter(email=_email, course=_course).count() < 0:
                return HttpResponse(409)
            else:
                enroll = Enroll(email=_email, course=_course)
                seat_config = {v: k for k, v in dict(map(lambda f: [f[0], int(f[1])],
                                                         map(lambda x: x.split("#"),
                                                             _course.seatConfig.replace("\n", '').strip().split(
                                                                 "\r")))).items()}
                count = Enroll.objects.filter(course=_course).count() + 1
                while (count < _course.maxTraineeAmount and (not seat_config.has_key(count))):
                    count += 1
                if (seat_config.has_key(count)):
                    enroll.seat = seat_config.get(count)
                else:
                    enroll.seat = u'候选'
                    enroll.isWaitingList = True
                enroll.save()
                try:
                    import tools
                    course_name = "".join(_course.courseName.split())
                    if len(course_name) > 8:
                        course_name = course_name[0:7]
                    qr_code = tools.generate_QRcode(
                        u"{email}|{seat}|{courseName}|{courseDateTime}".format(
                            email=enroll.email.split('@')[0],
                            seat=enroll.seat,
                            courseName=_course.courseName,
                            courseDateTime=_course.courseStartTime.strftime('%Y-%m-%d %H:%M:%S')),
                        enroll.email)
                    tools.send_mail(_course, enroll, qr_code)
                except Exception as e:
                   # print e
                    enroll.delete()
                    return HttpResponse(500)
            return HttpResponse(200)
        else:
            return HttpResponse(400)
    else:
        return HttpResponse(403)
