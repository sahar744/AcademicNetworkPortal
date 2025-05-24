import { GraduationCap, Mail, Phone, MapPin, Instagram, Send, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Association Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary text-white p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">انجمن علمی کامپیوتر</h3>
                <p className="text-sm text-muted-foreground">دانشگاه صنعتی شریف</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              انجمن علمی کامپیوتر دانشگاه صنعتی شریف با هدف ارتقای سطح علمی دانشجویان و ایجاد فضایی مناسب 
              برای تبادل تجربیات و دانش در حوزه علوم کامپیوتر تأسیس شده است.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="تلگرام"
              >
                <Send className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="اینستاگرام"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="لینکدین"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="گیت‌هاب"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  درباره انجمن
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  اعضای هیئت مدیره
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  اساسنامه
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  گالری تصاویر
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  تماس با ما
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">اطلاعات تماس</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>دانشگاه صنعتی شریف، تهران</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="latin" dir="ltr">cs.association@sharif.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="latin" dir="ltr">021-66165000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © ۱۴۰۳ انجمن علمی کامپیوتر دانشگاه صنعتی شریف. تمامی حقوق محفوظ است.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                حریم خصوصی
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                شرایط استفاده
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
