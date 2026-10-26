import type { Metadata, Viewport } from "next";
import { Montserrat, Caveat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const title = "Експрес-перевірка «Очима банку» · Outsistent";
const description =
  "Карта ризиків ваших рахунків і структури ФОП очима банку — за 3 робочі дні, навіть якщо банк ще нічого не запитував. Карина Замкова, податковий консультант.";

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/images/mark.png", apple: "/images/logo-vertical.png" },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "uk_UA",
    images: [{ url: "/images/hero-desk-1280.webp", width: 1280, height: 724 }],
  },
};

export const viewport: Viewport = { themeColor: "#11141b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" className={`${montserrat.variable} ${caveat.variable}`}>
      <body>
        {children}
        {/* Meta pixel (Kovcheg ad account test). The form fires SubmitApplication, not Lead, so Outsistent
            applications never mix with Kovcheg's own Lead optimisation on the same pixel. */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1569517924347556');fbq('track','PageView');`}</Script>
        {/* own visit counter for the CRM stats page: path, utm tags and referrer, no cookies */}
        <Script id="hit" strategy="afterInteractive">{`
try{if(!location.pathname.startsWith('/crm')){var b=JSON.stringify({p:location.pathname,q:location.search,r:document.referrer});
if(navigator.sendBeacon){navigator.sendBeacon('/api/hit',new Blob([b],{type:'application/json'}))}else{fetch('/api/hit',{method:'POST',headers:{'Content-Type':'application/json'},body:b,keepalive:true})}}}catch(e){}`}</Script>
      </body>
    </html>
  );
}
