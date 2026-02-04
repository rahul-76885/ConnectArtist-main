# 🎤 ConnectArtist

### *Showcase. Connect. Perform.*

## 🌟 Description

**ConnectArtist — Where talent meets opportunity.**
Discover artists, book talent in one click, automate payments and invoices, and manage events with a premium, modern experience.

---

## 🌍 Overview — Why I Built This

Artists often struggle to find verified, paid opportunities. Organizers waste time vetting talent and managing bookings. I built ConnectArtist to bring **transparency, automation, and trust** to the booking process — empowering artists to earn fairly and helping organizers book the right talent faster.

ConnectArtist provides a single, polished workflow: discovery → booking → payment → confirmation.

---

## 🚀 Key Innovations & Usefulness

* **Automated Booking Flow**: instant booking, payment capture (Razorpay), and auto-generated PDF confirmations (Puppeteer).
* **Professional Email System**: reliable SMTP (Nodemailer) notifies artists and organizers with transactional emails (booking, invoice, reminders, resets).
* **Verified Profiles & Admin Moderation**: reduces fraud and raises trust.
* **Cloud Media Storage**: Google Cloud for artist portfolios and media.
* **UX-first Design**: responsive, dark/light themes, animated booking confirmation with stateful download flow.

This makes the platform useful for freelancing musicians, performers, event planners, agencies, and cultural organisers.

---

## 🔥 Features (At-a-glance)

### 🎭 Artist

* Register & build portfolio (photos, video links, descriptions)
* Set genres, pricing & availability
* Receive booking requests with email alerts
* Downloadable PDF confirmations & contact sheets
* Community pages: groups and challenges

### 🧑‍💼 Organizer

* Advanced search filters (genre, price, city, rating)
* One-click booking & secure Razorpay payments
* Professional PDF confirmations
* Booking history & dashboard

### 🛡 Admin

* Role-based access control
* Approve/Reject artist profiles
* Manage bookings and disputes

### ⚙ System

* Puppeteer-based PDF generation (templates + QR codes)
* Nodemailer with SMTP for transactional emails
* Razorpay payment flow with webhook verification
* Google Cloud storage for media
* Deployed on Render

---

## 🧩 Tech Stack

**Frontend**: HTML5 • CSS3 • JavaScript (ES6) • Responsive design

**Backend**: Node.js • Express

**Database**: MongoDB (Mongoose)

**Payments**: Razorpay

**PDFs**: Puppeteer + Mustache templates

**Email**: SMTP (Nodemailer)

**Cloud / Hosting**: Google Cloud Storage, Render

---

## 📁 Folder Structure (Recommended)

```
/connectartist
│── /public          → Frontend (HTML/CSS/JS)
│── /views           → Templates (Mustache/EJS)
│── /routes          → Express routes
│── /controllers     → Controller logic
│── /models          → Mongoose schemas
│── /utils           → Puppeteer, Email, Cloud helpers
│── /config          → DB & Cloud config
│── server.js        → Entry point
```

---

## 👨‍💻 Author

**Rahul Raj** — Full-Stack Developer & AI/ML Enthusiast

ConnectArtist — *Showcase. Connect. Perform.*

---