import {
  Calendar,
  Shield,
  MessageCircle,
  FileText,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/ui/ImageWithFallback";

interface LandingPageProps {
  onNavigate: (page: "login" | "register") => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: Calendar,
      title: "ניהול מרוכז",
      description: "כל פרטי האירוע במקום אחד - ספקים, תשלומים וחוזים",
      gradient: "from-[#d4a960] to-[#c89645]",
    },
    {
      icon: Shield,
      title: "אמינות ובטיחות",
      description: "ספקים מאומתים ומהימנים המותאמים לציבור החרדי",
      gradient: "from-[#2d2d35] to-[#595964]",
    },
    {
      icon: MessageCircle,
      title: "תקשורת נוחה",
      description: "מערכת הודעות פנימית לתיאום מהיר עם הספקים",
      gradient: "from-[#a87a38] to-[#d4a960]",
    },
    {
      icon: FileText,
      title: "חוזים דיגיטליים",
      description: "חתימה ושמירה מאובטחת של מסמכים וחוזים",
      gradient: "from-[#595964] to-[#2d2d35]",
    },
  ];

  const steps = [
    { number: "1", text: "פתיחת אירוע והזנת פרטים בסיסיים", icon: Sparkles },
    { number: "2", text: "בחירת ספקים מתוך הקטלוג", icon: Star },
    { number: "3", text: "תקשורת וניהול חוזים", icon: MessageCircle },
    { number: "4", text: "מעקב אחר תשלומים והתקדמות", icon: Zap },
  ];

  return (
    <div className="min-h-screen" role="document">
      
      <section className="relative flex items-center justify-center h-screen overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 z-0">
<ImageWithFallback
  src="https://png.pngtree.com/thumb_back/fh260/background/20250822/pngtree-elegant-wedding-venue-with-luxurious-floral-decorations-sparkling-chandeliers-and-glossy-image_18234318.webp"
  alt="אולם אירועים אלגנטי ומואר"
  className="object-cover w-full h-full brightness-75"
/>






          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a20]/80 via-[#2d2d35]/70 to-[#1a1a20]/90"></div>

          <div className="absolute top-20 right-20 w-32 h-32 bg-[#d4a960]/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-40 left-40 w-40 h-40 bg-[#c89645]/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-5xl px-4 mx-auto text-center">
          {/* לוגו שלך בלבד במרכז, ללא עיגול */}
          <div className="flex justify-center mb-0 p-0" style={{marginBottom: 0, paddingBottom: 0}}>
            <img src="/src/assets/logo.png" alt="Évenu לוגו" className="h-72 w-auto" style={{display:'block'}} />
          </div>

          <h1 id="hero-heading" className="text-3xl font-light leading-tight text-white md:text-4xl lg:text-5xl mt-[-4rem]">
            ניהול אירועים חכם ומסודר
            <br />
            <span className="inline-block mt-2 text-gradient-gold">
              לציבור החרדי
            </span>
          </h1>
          {/* No extra style needed, margin handled by Tailwind */}

          <p className="max-w-3xl mx-auto mb-10 text-base font-light leading-relaxed text-white/90 md:text-lg">
            פלטפורמה מקצועית לניהול מלא של אירועים - מבחירת ספקים ועד לתשלום
            סופי.
            <br />
            <span className="text-[#d4a960]">
              הכל במקום אחד, בפשטות ובאלגנטיות.
            </span>
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row" role="group" aria-label="פעולות ראשיות">
            <Button
              onClick={() => onNavigate("register")}
              className="gradient-gold hover:opacity-90 text-white px-8 py-3.5 rounded-xl shadow-gold transition-all duration-300 hover:scale-105 hover:shadow-luxury-lg group text-base font-normal"
              aria-label="הירשם למערכת ותתחיל לנהל אירועים"
            >
              <span>התחל עכשיו</span>
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
            <Button
              onClick={() => onNavigate("login")}
              className="glass-dark border-2 border-[#d4a960]/40 text-white hover:bg-white/20 px-8 py-3.5 rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#d4a960]/60 text-base font-normal"
              aria-label="התחבר למערכת עם חשבון קיים"
            >
              <span>התחבר למערכת</span>
            </Button>
          </div>
        </div>
      </section>
      <section className="relative px-4 py-20 overflow-hidden bg-white" aria-labelledby="features-heading">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4a960]/30 to-transparent" aria-hidden="true"></div>

        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#faf6ed] to-[#f4ead5] px-4 py-1.5 rounded-full mb-4 shadow-sm">
              <Star className="w-4 h-4 text-[#d4a960]" />
              <span className="text-[#2d2d35] text-xs font-light">יתרונות המערכת</span>
            </div>
            <h2 id="features-heading" className="text-[#2d2d35] mb-3 text-2xl font-light">
              למה לבחור במערכת שלנו?
            </h2>
            <p className="text-[#6d6d78] text-sm max-w-2xl mx-auto leading-relaxed font-light">
              כל מה שאתם צריכים לניהול מושלם של האירוע שלכם
            </p>
          </div>

          <div className="grid max-w-5xl grid-cols-1 gap-5 mx-auto md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-5 rounded-xl bg-white border border-[#e3e3e6] hover:border-[#d4a960]/40 shadow-sm hover:shadow-luxury transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative mb-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`absolute inset-0 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                    ></div>
                  </div>
                  <h3 className="text-[#2d2d35] mb-2 text-base font-normal">
                    {feature.title}
                  </h3>
                  <p className="text-[#6d6d78] text-xs leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 overflow-hidden bg-[#f5f1e8]">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full mb-4 shadow-sm">
              <Zap className="w-4 h-4 text-[#d4a960]" />
              <span className="text-[#2d2d35] text-xs font-light">תהליך פשוט</span>
            </div>
            <h2 className="text-[#2d2d35] mb-3 text-2xl font-light">
              איך זה עובד?
            </h2>
            <p className="text-[#595964] text-sm font-light">
              ארבעה שלבים פשוטים לאירוע מושלם
            </p>
          </div>

          <div className="grid max-w-5xl grid-cols-1 gap-4 mx-auto md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="p-5 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md hover:-translate-y-1 group">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg shadow-sm gradient-gold">
                          <span className="text-xl font-semibold text-white">
                            {step.number}
                          </span>
                        </div>
                        <div className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-sm -top-1 -right-1">
                          <Icon className="w-3 h-3 text-[#d4a960]" />
                        </div>
                      </div>
                      <p className="text-[#2d2d35] text-xs leading-relaxed font-light">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#faf6ed] to-[#f4ead5] px-4 py-1.5 rounded-full mb-4 shadow-sm">
            <Shield className="w-4 h-4 text-[#d4a960]" />
            <span className="text-[#2d2d35] text-xs font-light">אמינות ומהימנות</span>
          </div>

          <h2 className="text-[#2d2d35] mb-3 text-2xl font-light">
            מערכת מאובטחת ומותאמת תרבותית
          </h2>
          <p className="text-[#6d6d78] text-sm mb-8 leading-relaxed max-w-3xl mx-auto font-light">
            המערכת שלנו נבנתה תוך התחשבות מלאה בערכים ובצרכים הייחודיים של
            הציבור החרדי. כל הספקים עוברים אימות קפדני, והמערכת מבטיחה פרטיות
            ואבטחה מלאה.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {["ספקים מאומתים", "פרטיות מלאה", "תמיכה צמודה", "התאמה תרבותית"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 glass px-5 py-2.5 rounded-lg border border-[#d4a960]/20 shadow-sm hover:shadow-luxury transition-all duration-300 hover:scale-105"
                >
                  <CheckCircle className="w-4 h-4 text-[#d4a960]" />
                  <span className="text-[#2d2d35] text-sm font-light">{item}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-charcoal"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#d4a960] rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-[#c89645] rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Sparkles className="w-12 h-12 text-[#d4a960] mx-auto mb-6 animate-pulse" />
          <h2 className="mb-6 text-3xl font-light leading-tight text-white md:text-4xl">
            מוכנים להתחיל?
          </h2>
          <p className="mb-8 text-base font-light leading-relaxed text-white/80">
            הצטרפו אלינו והפכו את ניהול האירוע שלכם לחוויה פשוטה ונעימה
          </p>
          <Button
            onClick={() => onNavigate("register")}
            className="px-8 py-3 text-base font-normal text-white transition-all duration-300 rounded-lg gradient-gold hover:opacity-90 shadow-gold hover:scale-105 hover:shadow-luxury-lg group"
          >
            צור חשבון חינם
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      <footer className="bg-[#1a1a20] text-white/60 py-6 px-4 border-t border-[#d4a960]/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-gold">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-light text-white">מערכת ניהול אירועים</span>
            </div>
            <p className="text-xs font-light text-center">
              © 2025 כל הזכויות שמורות • מערכת מקצועית לניהול אירועים
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
