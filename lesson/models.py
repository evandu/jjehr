#-*- coding: UTF-8 -*-
from django.db import models
from lesson.manager import CourseManager
from lesson.validation import validate_enroll

class Course(models.Model):
    courseName = models.CharField(max_length=50, verbose_name="课程名称")
    event_type = models.ForeignKey("event.EventType", verbose_name="活动类型", db_column="event_type", null=True,
        on_delete=models.SET_NULL, blank=True)
    courseDescription = models.TextField(blank=True, verbose_name="课程介绍")
    #课时
    courseTime = models.IntegerField(blank=True, verbose_name="课时")
    #课程时间安排
    courseArrange = models.CharField(max_length=100, blank=True, verbose_name="课程安排")
    #主讲
    courseSpeaker = models.CharField(max_length=30, verbose_name="主讲人")

    enrollStartTime = models.DateTimeField(verbose_name="报名开始时间",help_text="yyyy-MM-dd HH:mm:ss 比如:2014-05-18 13:00:00")
    #允许报名人数
    enrollEndTime = models.DateTimeField(verbose_name="报名结束时间",help_text="yyyy-MM-dd HH:mm:ss 比如:2014-05-20 17:59:59")

    courseStartTime = models.DateTimeField(verbose_name="课程开始时间",help_text="yyyy-MM-dd HH:mm:ss 比如:2014-05-21 16:30:00")

    maxTraineeAmount = models.IntegerField(verbose_name="最大名额")
    seatConfig = models.TextField(verbose_name="座位分配",help_text='比如:[VIP专属座位#10]，如果有多个座位请回车换行输入')
    courseWare = models.FileField(upload_to='courseWare_%Y_%m_%d_%M_%S', blank=True, verbose_name="课件")
    createDate = models.DateTimeField(auto_now_add=True)
    updatedDate = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    search_objects = CourseManager()

    def __unicode__(self):
        return '(courseName = %s)' % (self.courseName,)


class Enroll(models.Model):
    email = models.EmailField()
    member_name = models.CharField(max_length=30, blank=True)
    course = models.ForeignKey('Course', db_column='courseId')
    isWaitingList = models.BooleanField(default=False)
    enrollTime = models.DateTimeField(auto_now_add=True)
    createdDate = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return '(email = %s)' % (self.email,)





