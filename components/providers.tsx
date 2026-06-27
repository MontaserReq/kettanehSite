"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { SessionProvider } from "next-auth/react"

type Language = "ar" | "en"
type Theme = "dark" | "light"
type LocalizedSetting = { ar: string; en: string }
type DynamicSettingValue = LocalizedSetting | any[] | string

interface SettingsContextType {
  language: Language
  theme: Theme
  toggleLanguage: () => void
  toggleTheme: () => void
  t: (key: string) => string
  dynamicSettings: Record<string, DynamicSettingValue>
  primaryColor: string
  faviconUrl: string
  refreshSettings: () => Promise<void>
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.portfolio": "الأعمال",
    "nav.academic": "المؤهلات",
    "nav.skills": "المهارات",
    "nav.contact": "تواصل",
    "nav.contactMe": "تواصل معي",
    
    // Hero
    "hero.badge": "تخصصك",
    "hero.firstName": "فلان",
    "hero.lastName": "الفلاني",
    "hero.subtitle": "وصف عام عنك",
    "hero.exploreWork": "استكشف أعمالي",
    "hero.watchWork": "شاهد أعمالي",
    "hero.discoverMore": "اكتشف المزيد",
    "hero.yearsExp": "سنوات خبرة",
    "hero.Projects": "مشاريع",
    "hero.events": "فعاليات",
    
    // Portfolio
    "portfolio.title": "أعمالي ",
    "portfolio.subtitle": "مجموعة متنوعة من الأعمال الـ...",
    "portfolio.all": "الكل",
    "portfolio.viewProject": "عرض المشروع",
    
    // Academic
    "academic.badge": "المسيرة الأكاديمية",
    "academic.title": "التعليم والمؤهلات",
    "academic.subtitle": "خلفية أكاديمية قوية في الإعلام والاتصال",
    "academic.education": "التعليم",
    "academic.certificates": "الشهادات",
    "academic.training": "الدورات التدريبية",
    
    // Skills
    "skills.badge": "مهاراتي المهنية",
    "skills.title": "الخبرات والمهارات",
    "skills.subtitle": "مهارات متنوعة في مجال الـ...",
    "skills.experience": "الخبرة المهنية",
    "skills.present": "حالياً",
    
    // Contact
    "contact.badge": "تواصل معي",
    "contact.title": "لنعمل معاً",
    "contact.subtitle": "أسعد بالتواصل معكم لمناقشة فرص التعاون والمشاريع ",
    "contact.info": "معلومات التواصل",
    "contact.email": "البريد الإلكتروني",
    "contact.phone": "رقم الهاتف",
    "contact.location": "الموقع",
    "contact.workingHours": "ساعات العمل",
    "contact.sunThu": "الأحد - الخميس",
    "contact.friSat": "الجمعة - السبت",
    "contact.closed": "مغلق",

    // Admin Settings
    "admin.settings.title": "الإعدادات",
    "admin.settings.subtitle": "إدارة إعدادات التطبيق والمحتوى",
    "admin.settings.addNew": "إضافة جديد",
    "admin.settings.heroSection": "القسم الأساسي",
    "admin.settings.heroSectionDesc": "إدارة محتوى القسم الأساسي  في الصفحة الرئيسية",
    "admin.settings.badgeText": "نص الشارة",
    "admin.settings.firstName": "الاسم الأول",
    "admin.settings.lastName": "اسم العائلة",
    "admin.settings.subtitleLabel": "عنوان فرعي",
    "admin.settings.yearsOfExperience": "سنوات الخبرة",
    "admin.settings.yearsOfExperienceLabel": "تسمية سنوات الخبرة",
    "admin.settings.Projects": "المشاريع",
    "admin.settings.ProjectsLabel": "تسمية المشاريع ",
    "admin.settings.Label1": "قيمة الليبل",
    "admin.settings.Label1Label": "ليبل",
    "admin.settings.navigationTitle": "عنوان التنقل",
    "admin.settings.edit": "تعديل",
    "admin.settings.addNewEntry": "إضافة إدخال جديد",
    "admin.settings.updateDetails": "تحديث التفاصيل",
    "admin.settings.key": "المفتاح",
    "admin.settings.arabicValue": "القيمة العربية",
    "admin.settings.englishValue": "القيمة الإنجليزية",
    "admin.settings.cancel": "إلغاء",
    "admin.settings.confirmDelete": "هل أنت متأكد من حذف هذا الإعداد؟",
    "admin.settings.updateSetting": "تحديث الإعداد",
    "admin.settings.createSetting": "إنشاء إعداد",
    "contact.sendMessage": "أرسل رسالة",
    "contact.name": "الاسم",
    "contact.namePlaceholder": "اسمك الكريم",
    "contact.emailPlaceholder": "email@example.com",
    "contact.subject": "الموضوع",
    "contact.subjectPlaceholder": "موضوع الرسالة",
    "contact.message": "الرسالة",
    "contact.messagePlaceholder": "اكتب رسالتك هنا...",
    "contact.submit": "إرسال الرسالة",
    "contact.sending": "جاري الإرسال...",
    "contact.thankYou": "شكراً لتواصلك!",
    "contact.willReply": "سأرد عليك في أقرب وقت ممكن",
    "contact.sendAnother": "إرسال رسالة أخرى",
    "contact.whatsapp": "تواصل عبر واتساب",
    "hero.contactMe": "تواصل معي",
    
    // Footer
    "footer.description": "اكتب وصف مختصر عنك",
    "footer.quickLinks": "روابط سريعة",
    "footer.followMe": "تابعني على",
    "footer.rights": "جميع الحقوق محفوظة",
    "footer.designedIn": "developed & design by codelineJO",
    "footer.carrer": "مثلا ( مبرمج واجهات امامية )",

    // Admin Dashboard
    "admin.dashboard.title": "لوحة التحكم",
    "admin.dashboard.welcome": "مرحباً بك في لوحة تحكم محفظة الأعمال",
    "admin.dashboard.projects": "المشاريع",
    "admin.dashboard.projectsDesc": "مشاريع المحفظة",
    "admin.dashboard.education": "التعليم",
    "admin.dashboard.educationDesc": "الخلفية التعليمية",
    "admin.dashboard.certificates": "الشهادات",
    "admin.dashboard.certificatesDesc": "الشهادات والجوائز",
    "admin.dashboard.skills": "المهارات",
    "admin.dashboard.skillsDesc": "المهارات المهنية",
    "admin.dashboard.experience": "الخبرة",
    "admin.dashboard.experienceDesc": "خبرة العمل",
    "admin.dashboard.contact": "التواصل",
    "admin.dashboard.contactDesc": "معلومات التواصل",
    "admin.dashboard.training": "التدريب",
    "admin.dashboard.trainingDesc": "دورات التدريب",
    "admin.dashboard.settings": "الإعدادات",
    "admin.dashboard.settingsDesc": "إعدادات الموقع",
    "admin.dashboard.quickActions": "الإجراءات السريعة",
    "admin.dashboard.quickActionsDesc": "المهام الإدارية الشائعة",
    "admin.dashboard.addProject": "إضافة مشروع",
    "admin.dashboard.addProjectDesc": "إنشاء عنصر محفظة جديد",
    "admin.dashboard.addCertificate": "إضافة شهادة",
    "admin.dashboard.addCertificateDesc": "إضافة شهادة جديدة",
    "admin.dashboard.addExperience": "إضافة خبرة",
    "admin.dashboard.addExperienceDesc": "إضافة خبرة عمل",
    "admin.dashboard.updateContact": "تحديث التواصل",
    "admin.dashboard.updateContactDesc": "إدارة معلومات التواصل",
    "admin.dashboard.systemStatus": "حالة النظام",
    "admin.dashboard.systemStatusDesc": "معلومات النظام الحالية",
    "admin.dashboard.database": "قاعدة البيانات",
    "admin.dashboard.apiStatus": "حالة API",
    "admin.dashboard.lastUpdated": "آخر تحديث",
    "admin.dashboard.connected": "متصل",
    "admin.dashboard.online": "متصل",

    // Admin Layout
    "admin.layout.title": "لوحة تحكم الإدارة",
    "admin.layout.welcome": "مرحباً",
    "admin.layout.signOut": "تسجيل الخروج",
    "admin.layout.dashboard": "لوحة التحكم",
    "admin.layout.projects": "المشاريع",
    "admin.layout.education": "التعليم",
    "admin.layout.certificates": "الشهادات",
    "admin.layout.skills": "المهارات",
    "admin.layout.experience": "الخبرة",
    "admin.layout.contact": "التواصل",
    "admin.layout.training": "التدريب",
    "admin.layout.settings": "الإعدادات",

    // Admin Pages - Common
    "admin.common.add": "إضافة",
    "admin.common.edit": "تعديل",
    "admin.common.delete": "حذف",
    "admin.common.save": "حفظ",
    "admin.common.cancel": "إلغاء",
    "admin.common.loading": "جارٍ التحميل...",
    "admin.common.noData": "لا توجد بيانات",
    "admin.common.confirmDelete": "هل أنت متأكد من الحذف؟",
    "admin.common.success": "تم بنجاح",
    "admin.common.error": "خطأ",
    "admin.common.back": "العودة",

    // Projects Admin
    "admin.projects.title": "إدارة المشاريع",
    "admin.projects.addNew": "إضافة مشروع جديد",
    "admin.projects.name": "اسم المشروع",
    "admin.projects.description": "الوصف",
    "admin.projects.image": "الصورة",
    "admin.projects.link": "الرابط",
    "admin.projects.category": "الفئة",
    "admin.projects.technologies": "التقنيات",
    "admin.projects.date": "التاريخ",

    // Education Admin
    "admin.education.title": "إدارة التعليم",
    "admin.education.subtitle": "إدارة الخلفية التعليمية الخاصة بك",
    "admin.education.addNew": "إضافة مؤهل تعليمي جديد",
    "admin.education.degree": "الدرجة العلمية",
    "admin.education.addNewEntry": "أضف مدخلاً تعليمياً جديداً",
    "admin.education.institution": "المؤسسة",
    "admin.education.field": "التخصص",
    "admin.education.startDate": "تاريخ البدء",
    "admin.education.endDate": "تاريخ الانتهاء",
    "admin.education.grade": "التقدير",

    // Certificates Admin
    "admin.certificates.title": "إدارة الشهادات",
    "admin.certificates.addNew": "إضافة شهادة جديدة",
    "admin.certificates.name": "اسم الشهادة",
    "admin.certificates.issuer": "الجهة المصدرة",
    "admin.certificates.date": "تاريخ الإصدار",
    "admin.certificates.credentialId": "رقم الاعتماد",

    // Skills Admin
    "admin.skills.title": "إدارة المهارات",
    "admin.skills.addNew": "إضافة مهارة جديدة",
    "admin.skills.name": "اسم المهارة",
    "admin.skills.level": "المستوى",
    "admin.skills.category": "الفئة",

    // Experience Admin
    "admin.experience.title": "إدارة الخبرة",
    "admin.experience.addNew": "إضافة خبرة عمل جديدة",
    "admin.experience.position": "المنصب",
    "admin.experience.company": "الشركة",
    "admin.experience.location": "الموقع",
    "admin.experience.startDate": "تاريخ البدء",
    "admin.experience.endDate": "تاريخ الانتهاء",
    "admin.experience.description": "الوصف",
    "admin.experience.current": "حالي",

    // Contact Admin
    "admin.contact.title": "إدارة معلومات التواصل",
    "admin.contact.addNew": "إضافة معلومات تواصل جديدة",
    "admin.contact.type": "نوع التواصل",
    "admin.contact.value": "القيمة",
    "admin.contact.label": "التسمية",

    // Training Admin
    "admin.training.title": "إدارة الدورات التدريبية",
    "admin.training.addNew": "إضافة دورة تدريبية جديدة",
    "admin.training.name": "اسم الدورة",
    "admin.training.provider": "مقدم الدورة",
    "admin.training.date": "تاريخ الإكمال",
    "admin.training.certificate": "الشهادة",

    // Projects Admin
    "admin.projects.subtitle": "إدارة مشاريع محفظة الأعمال",
    "admin.projects.edit": "تعديل المشروع",
    "admin.projects.delete": "حذف المشروع",
    "admin.projects.confirmDelete": "هل أنت متأكد من حذف هذا المشروع؟",
    "admin.projects.arabicTitle": "العنوان بالعربية",
    "admin.projects.englishTitle": "العنوان بالإنجليزية",
    "admin.projects.arabicDescription": "الوصف بالعربية",
    "admin.projects.englishDescription": "الوصف بالإنجليزية",
    "admin.projects.type": "النوع",
    "admin.projects.imageUrl": "رابط الصورة",
    "admin.projects.selectCategory": "اختر الفئة",
    "admin.projects.selectType": "اختر النوع",
    "admin.projects.cancel": "إلغاء",
    "admin.projects.update": "تحديث",
    "admin.projects.create": "إنشاء",
    "admin.projects.updateProject": "تحديث المشروع",
    "admin.projects.createProject": "إنشاء مشروع",
    "admin.projects.updateDetails": "تحديث تفاصيل المشروع",
    "admin.projects.createNew": "إنشاء مشروع جديد لمحفظة الأعمال",

    // Login Admin
    "admin.login.title": "تسجيل الدخول للإدارة",
    "admin.login.description": "سجل الدخول للوصول إلى لوحة التحكم",
    "admin.login.email": "البريد الإلكتروني",
    "admin.login.password": "كلمة المرور",
    "admin.login.signIn": "تسجيل الدخول",
    "admin.login.invalidCredentials": "بيانات الدخول غير صحيحة",
    "admin.login.accessDenied": "الوصول مرفوض",
    "admin.login.errorOccurred": "حدث خطأ",

    // Settings Admin
   
    "admin.settings.addNewSetting": "إضافة إعداد جديد",
    "admin.settings.updateSettingDetails": "تحديث تفاصيل الإعداد",
    "admin.settings.addNewSettingDesc": "إضافة إعداد جديد",
    },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.portfolio": "Portfolio",
    "nav.academic": "Academic",
    "nav.skills": "Skills",
    "nav.contact": "Contact",
    "nav.contactMe": "Contact Me",
    
    // Hero
    "hero.badge": "Your Profession",
    "hero.firstName": "First Name",
    "hero.lastName": "Last Name",
    "hero.subtitle": "A brief description about yourself",
    "hero.exploreWork": "Explore My Work",
    "hero.watchWork": "Watch My Work",
    "hero.discoverMore": "Discover More",
    "hero.yearsExp": "Years Experience",
    "hero.Projects": "Projects",
    "hero.events": "Events",
    
    // Portfolio
    "portfolio.title": "Works",
    "portfolio.subtitle": "A diverse collection of .... projects",
    "portfolio.all": "All",
    "portfolio.written": "Written",
    "portfolio.visual": "Visual",
    "portfolio.audio": "Audio",
    "portfolio.viewProject": "View Project",
    
    // Academic
    "academic.badge": "Academic Journey",
    "academic.title": "Education & Qualifications",
    "academic.subtitle": "Strong academic background in media and communication",
    "academic.education": "Education",
    "academic.certificates": "Certificates",
    "academic.training": "Training Courses",
    
    // Skills
    "skills.badge": "Professional Skills",
    "skills.title": "Experience & Skills",
    "skills.subtitle": "Diverse skills in ...",
    "skills.experience": "Professional Experience",
    "skills.present": "Present",
    
    // Contact
    "contact.badge": "Get In Touch",
    "contact.title": "Let's Work Together",
    "contact.subtitle": "I'd be happy to discuss collaboration opportunities and media projects",
    "contact.info": "Contact Information",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.location": "Location",
    "contact.workingHours": "Working Hours",
    "contact.sunThu": "Sunday - Thursday",
    "contact.friSat": "Friday - Saturday",
    "contact.closed": "Closed",

    // Admin Settings
    "admin.settings.title": "Settings",
    "admin.settings.subtitle": "Manage application settings and content",
    "admin.settings.addNew": "Add New",
    "admin.settings.heroSection": "Hero Section",
    "admin.settings.heroSectionDesc": "Manage hero section content on the homepage",
    "admin.settings.badgeText": "Badge Text",
    "admin.settings.firstName": "First Name",
    "admin.settings.lastName": "Last Name",
    "admin.settings.subtitleLabel": "Subtitle",
    "admin.settings.yearsOfExperience": "Years of Experience",
    "admin.settings.yearsOfExperienceLabel": "Years of Experience Label",
    "admin.settings.Projects": " Projects",
    "admin.settings.ProjectsLabel": " Projects Label",
    "admin.settings.Label1": "value of Label",
    "admin.settings.Label1Label": " Label",
    "admin.settings.navigationTitle": "Navigation Title",
    "admin.settings.edit": "Edit",
    "admin.settings.addNewEntry": "Add new entry",
    "admin.settings.updateDetails": "Update details",
    "admin.settings.key": "Key",
    "admin.settings.arabicValue": "Arabic Value",
    "admin.settings.englishValue": "English Value",
    "admin.settings.cancel": "Cancel",
    "admin.settings.confirmDelete": "Are you sure you want to delete this setting?",
    "admin.settings.updateSetting": "Update Setting",
    "admin.settings.createSetting": "Create Setting",
    "contact.sendMessage": "Send a Message",
    "contact.name": "Name",
    "contact.namePlaceholder": "Your name",
    "contact.emailPlaceholder": "email@example.com",
    "contact.subject": "Subject",
    "contact.subjectPlaceholder": "Message subject",
    "contact.message": "Message",
    "contact.messagePlaceholder": "Write your message here...",
    "contact.submit": "Send Message",
    "contact.sending": "Sending...",
    "contact.thankYou": "Thank you for reaching out!",
    "contact.willReply": "I'll get back to you as soon as possible",
    "contact.sendAnother": "Send Another Message",
    "contact.whatsapp": "Contact via WhatsApp",
    "hero.contactMe": "Contact Me",
    
    // Footer
    "footer.description": "short description about yourself",
    "footer.quickLinks": "Quick Links",
    "footer.followMe": "Follow Me",
    "footer.rights": "All Rights Reserved",
    "footer.designedIn": "Designed & Developed by CodeLine Jo",
    "footer.carrer": "example( Front End developer )",

    // Admin Dashboard
    "admin.dashboard.title": "Dashboard",
    "admin.dashboard.welcome": "Welcome to your portfolio admin dashboard",
    "admin.dashboard.projects": "Projects",
    "admin.dashboard.projectsDesc": "Portfolio projects",
    "admin.dashboard.education": "Education",
    "admin.dashboard.educationDesc": "Educational background",
    "admin.dashboard.certificates": "Certificates",
    "admin.dashboard.certificatesDesc": "Certifications & awards",
    "admin.dashboard.skills": "Skills",
    "admin.dashboard.skillsDesc": "Professional skills",
    "admin.dashboard.experience": "Experience",
    "admin.dashboard.experienceDesc": "Work experience",
    "admin.dashboard.contact": "Contact",
    "admin.dashboard.contactDesc": "Contact information",
    "admin.dashboard.training": "Training",
    "admin.dashboard.trainingDesc": "Training courses",
    "admin.dashboard.settings": "Settings",
    "admin.dashboard.settingsDesc": "Site settings",
    "admin.dashboard.quickActions": "Quick Actions",
    "admin.dashboard.quickActionsDesc": "Common administrative tasks",
    "admin.dashboard.addProject": "Add Project",
    "admin.dashboard.addProjectDesc": "Create new portfolio item",
    "admin.dashboard.addCertificate": "Add Certificate",
    "admin.dashboard.addCertificateDesc": "Add new certification",
    "admin.dashboard.addExperience": "Add Experience",
    "admin.dashboard.addExperienceDesc": "Add work experience",
    "admin.dashboard.updateContact": "Update Contact",
    "admin.dashboard.updateContactDesc": "Manage contact info",
    "admin.dashboard.systemStatus": "System Status",
    "admin.dashboard.systemStatusDesc": "Current system information",
    "admin.dashboard.database": "Database",
    "admin.dashboard.apiStatus": "API Status",
    "admin.dashboard.lastUpdated": "Last Updated",
    "admin.dashboard.connected": "Connected",
    "admin.dashboard.online": "Online",

    // Admin Layout
    "admin.layout.title": "Admin Dashboard",
    "admin.layout.welcome": "Welcome",
    "admin.layout.signOut": "Sign Out",
    "admin.layout.dashboard": "Dashboard",
    "admin.layout.projects": "Projects",
    "admin.layout.education": "Education",
    "admin.layout.certificates": "Certificates",
    "admin.layout.skills": "Skills",
    "admin.layout.experience": "Experience",
    "admin.layout.contact": "Contact",
    "admin.layout.training": "Training",
    "admin.layout.settings": "Settings",

    // Admin Pages - Common
    "admin.common.add": "Add",
    "admin.common.edit": "Edit",
    "admin.common.delete": "Delete",
    "admin.common.save": "Save",
    "admin.common.cancel": "Cancel",
    "admin.common.loading": "Loading...",
    "admin.common.noData": "No data available",
    "admin.common.confirmDelete": "Are you sure you want to delete?",
    "admin.common.success": "Success",
    "admin.common.error": "Error",
    "admin.common.back": "Back",

    // Projects Admin
    "admin.projects.title": "Projects Management",
    "admin.projects.addNew": "Add New Project",
    "admin.projects.name": "Project Name",
    "admin.projects.description": "Description",
    "admin.projects.image": "Image",
    "admin.projects.link": "Link",
    "admin.projects.category": "Category",
    "admin.projects.technologies": "Technologies",
    "admin.projects.date": "Date",

    // Education Admin
    "admin.education.title": "Education Management",
    "admin.education.addNew": "Add New Education",
    "admin.education.degree": "Degree",
    "admin.education.institution": "Institution",
    "admin.education.field": "Field of Study",
    "admin.education.startDate": "Start Date",
    "admin.education.endDate": "End Date",
    "admin.education.grade": "Grade",

    // Certificates Admin
    "admin.certificates.title": "Certificates Management",
    "admin.certificates.addNew": "Add New Certificate",
    "admin.certificates.name": "Certificate Name",
    "admin.certificates.issuer": "Issuer",
    "admin.certificates.date": "Issue Date",
    "admin.certificates.credentialId": "Credential ID",

    // Skills Admin
    "admin.skills.title": "Skills Management",
    "admin.skills.addNew": "Add New Skill",
    "admin.skills.name": "Skill Name",
    "admin.skills.level": "Level",
    "admin.skills.category": "Category",

    // Experience Admin
    "admin.experience.title": "Experience Management",
    "admin.experience.addNew": "Add New Experience",
    "admin.experience.position": "Position",
    "admin.experience.company": "Company",
    "admin.experience.location": "Location",
    "admin.experience.startDate": "Start Date",
    "admin.experience.endDate": "End Date",
    "admin.experience.description": "Description",
    "admin.experience.current": "Current",

    // Contact Admin
    "admin.contact.title": "Contact Information Management",
    "admin.contact.addNew": "Add New Contact Info",
    "admin.contact.type": "Contact Type",
    "admin.contact.value": "Value",
    "admin.contact.label": "Label",

    // Training Admin
    "admin.training.title": "Training Courses Management",
    "admin.training.addNew": "Add New Training Course",
    "admin.training.name": "Course Name",
    "admin.training.provider": "Provider",
    "admin.training.date": "Completion Date",
    "admin.training.certificate": "Certificate",

    // Projects Admin
    "admin.projects.subtitle": "Manage your portfolio projects",
    "admin.projects.edit": "Edit Project",
    "admin.projects.delete": "Delete Project",
    "admin.projects.confirmDelete": "Are you sure you want to delete this project?",
    "admin.projects.arabicTitle": "Arabic Title",
    "admin.projects.englishTitle": "English Title",
    "admin.projects.arabicDescription": "Arabic Description",
    "admin.projects.englishDescription": "English Description",
    "admin.projects.type": "Type",
    "admin.projects.imageUrl": "Image URL",
    "admin.projects.selectCategory": "Select category",
    "admin.projects.selectType": "Select type",
    "admin.projects.cancel": "Cancel",
    "admin.projects.update": "Update",
    "admin.projects.create": "Create",
    "admin.projects.updateProject": "Update Project",
    "admin.projects.createProject": "Create Project",
    "admin.projects.updateDetails": "Update the project details",
    "admin.projects.createNew": "Create a new project for your portfolio",

    // Education Admin
    "admin.education.subtitle": "Manage your educational background",
    "admin.education.edit": "Edit Education",
    "admin.education.delete": "Delete Education",
    "admin.education.confirmDelete": "Are you sure you want to delete this education?",
    "admin.education.arabicDegree": "Arabic Degree",
    "admin.education.englishDegree": "English Degree",
    "admin.education.arabicInstitution": "Arabic Institution",
    "admin.education.englishInstitution": "English Institution",
    "admin.education.year": "Year",
    "admin.education.arabicDescription": "Arabic Description",
    "admin.education.englishDescription": "English Description",
    "admin.education.cancel": "Cancel",
    "admin.education.update": "Update",
    "admin.education.create": "Create",
    "admin.education.updateEducation": "Update Education",
    "admin.education.createEducation": "Create Education",
    "admin.education.updateDetails": "Update the education details",
    "admin.education.addNewEntry": "Add a new education entry",

    // Login Admin
    "admin.login.title": "Admin Login",
    "admin.login.description": "Sign in to access the admin dashboard",
    "admin.login.email": "Email",
    "admin.login.password": "Password",
    "admin.login.signIn": "Sign In",
    "admin.login.invalidCredentials": "Invalid credentials",
    "admin.login.accessDenied": "Access denied",
    "admin.login.errorOccurred": "An error occurred",

  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function parseSettings(settings: Record<string, string>) {
  const parsedSettings: Record<string, DynamicSettingValue> = {}
  let parsedPrimaryColor = "#3b82f6"
  let parsedFaviconUrl = "/defaulticon.svg"

  for (const [key, value] of Object.entries(settings)) {
    if (key === "primaryColor") {
      parsedPrimaryColor = value
      parsedSettings[key] = value
      continue
    }

    if (key === "faviconUrl") {
      parsedFaviconUrl = value
      parsedSettings[key] = value
      continue
    }

    if (key === "socialLinks") {
      try {
        const parsed = JSON.parse(value)
        parsedSettings[key] = Array.isArray(parsed) ? parsed : value
      } catch {
        parsedSettings[key] = value
      }
      continue
    }

    try {
      const parsed = JSON.parse(value)
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed) &&
        typeof parsed.ar === "string" &&
        typeof parsed.en === "string"
      ) {
        parsedSettings[key] = parsed
      } else if (Array.isArray(parsed)) {
        parsedSettings[key] = parsed
      } else {
        parsedSettings[key] = value
      }
    } catch {
      parsedSettings[key] = value
    }
  }

  return { parsedSettings, parsedPrimaryColor, parsedFaviconUrl }
}

export function SettingsProvider({
  children,
  initialSettings = {},
}: {
  children: React.ReactNode
  initialSettings?: Record<string, string>
}) {
  const initialParsedSettings = parseSettings(initialSettings)
  const [language, setLanguage] = useState<Language>("ar")
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const [dynamicSettings, setDynamicSettings] = useState<Record<string, DynamicSettingValue>>(initialParsedSettings.parsedSettings)
  const [primaryColor, setPrimaryColor] = useState<string>(initialParsedSettings.parsedPrimaryColor)
  const [faviconUrl, setFaviconUrl] = useState<string>(initialParsedSettings.parsedFaviconUrl)

  useEffect(() => {
    setMounted(true)
    // Load saved preferences
    const savedLang = localStorage.getItem("language") as Language
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedLang) setLanguage(savedLang)
    if (savedTheme) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    if (!mounted) return
    // Update document direction and class
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
    localStorage.setItem("language", language)
  }, [language, mounted])

  useEffect(() => {
    if (!mounted) return
    // Update theme class
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted) return
    // Update primary color and all related CSS variables for comprehensive theme change
    document.documentElement.style.setProperty('--primary', primaryColor)
    document.documentElement.style.setProperty('--ring', primaryColor)
    document.documentElement.style.setProperty('--chart-1', primaryColor)
    document.documentElement.style.setProperty('--sidebar-primary', primaryColor)
    document.documentElement.style.setProperty('--sidebar-ring', primaryColor)
    // Also update accent and other related colors to maintain theme consistency
    document.documentElement.style.setProperty('--accent', primaryColor)
    document.documentElement.style.setProperty('--chart-2', primaryColor)
    document.documentElement.style.setProperty('--chart-3', primaryColor)
    document.documentElement.style.setProperty('--chart-4', primaryColor)
    document.documentElement.style.setProperty('--chart-5', primaryColor)

    // Extract RGB values for neon glow effects
    const hex = primaryColor.replace('#', '')
    const isHexColor = /^[0-9a-fA-F]{6}$/.test(hex)
    const r = isHexColor ? parseInt(hex.substr(0, 2), 16) : 59
    const g = isHexColor ? parseInt(hex.substr(2, 2), 16) : 130
    const b = isHexColor ? parseInt(hex.substr(4, 2), 16) : 246
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`)
  }, [primaryColor, mounted])

  const fetchDynamicSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/settings", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        const { parsedSettings, parsedPrimaryColor, parsedFaviconUrl } = parseSettings(data)
        setPrimaryColor(parsedPrimaryColor)
        setFaviconUrl(parsedFaviconUrl)
        setDynamicSettings(parsedSettings)
      }
    } catch (error) {
      console.error("Failed to fetch dynamic settings:", error)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchDynamicSettings()
    }
  }, [mounted, fetchDynamicSettings])

  const refreshSettings = useCallback(async () => {
    await fetchDynamicSettings()
  }, [fetchDynamicSettings])

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const t = useCallback(
    (key: string) => {
      // Check dynamic settings first
      if (dynamicSettings[key] && typeof dynamicSettings[key] === 'object' && !Array.isArray(dynamicSettings[key]) && 'ar' in dynamicSettings[key] && 'en' in dynamicSettings[key]) {
        return dynamicSettings[key][language] || dynamicSettings[key].en || key
      }
      // Fall back to hardcoded translations
      return translations[language][key] || key
    },
    [language, dynamicSettings]
  )

  return (
    <SessionProvider basePath="/api/auth">
      <SettingsContext.Provider value={{ language, theme, toggleLanguage, toggleTheme, t, dynamicSettings, primaryColor, faviconUrl, refreshSettings }}>
        {children}
      </SettingsContext.Provider>
    </SessionProvider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
