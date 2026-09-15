from app.models.user import User, Role, UserRole, Permission, RolePermission, Session, PasswordResetToken, StudentProfile, TeacherProfile, ParentStudent
from app.models.course import Course, Module, Lesson, LessonMaterial
from app.models.enrollment import Enrollment, EnrollmentLessonStatus, LessonUnlockLog, Group, GroupTeacher
from app.models.assignment import Assignment, Submission, SubmissionFile, Grade
from app.models.attendance import ClassSession, Attendance, AttendanceReason, MakeupLesson
from app.models.payment import Invoice, Payment, PaymentAllocation
from app.models.progress import Progress, ProgressOverrideLog
from app.models.chat import ChatRoom, ChatMember, Message, MessageFile
from app.models.notification import Notification
from app.models.file import File, Project

