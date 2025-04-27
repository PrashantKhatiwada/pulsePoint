
# 🗺️ Crisis Reporting Map App

This project is a real-time, interactive crisis reporting system where users can:

- View nearby crisis incidents (fires, medical emergencies, infrastructure issues, etc.) plotted on a map 🗺️
- See live markers based on urgency level (Critical, High, Medium, Low)
- Track their own location and recent reports
- Search and filter crisis reports
- Zoom and center the map easily with custom controls

Built using **React.js**, **React-Leaflet**, **Lucide Icons**, and **TailwindCSS**.

---

## 🚀 Features

- 📍 **Map view** with custom dynamic markers (color-coded by urgency)
- 📡 **User's current location** shown on the map
- 🔍 **Search and filter** through crisis reports
- 🎛️ **Zoom in, zoom out, locate me** buttons
- 🗂️ **Categorized icons** (Fire, Medical, Police, Infrastructure, Natural Disaster, etc.)
- ⚡ **Animated markers** and **loading optimization** to prevent crashes
- 📱 **Responsive design** ready for mobile and desktop

---

## 🛠️ Technologies Used

- **React.js** — Frontend Framework
- **React-Leaflet** — For interactive map and markers
- **Leaflet.js** — Map engine
- **TailwindCSS** — For clean styling
- **Lucide-React** — Beautiful SVG icons
- **Framer Motion** — Animations for smooth UI interactions
- **Vite** (optional) — For fast development server

---

## 📦 Installation

Clone this repo and install dependencies:

```bash
git clone https://github.com/PrashantKhatiwada/pulsePoint.git
cd pulsePoint
npm install
```

Start the development server:

```bash
npm run dev
```

> Make sure you have Node.js and npm installed.

---

## 📋 Project Structure

```
src/
├── components/
│   ├── MapView.jsx        # Map with markers and user location
│   ├── ReportsList.jsx    # Sidebar list of crisis reports
│   └── ui/                # Reusable UI components (Button, Badge, Card, etc.)
├── api/                   # (Optional) Fetch reports from backend
├── App.jsx                # Main app
└── index.jsx              # App entry point
```

---

## ⚙️ How it works

- Map loads centered either at the user's geolocation or a default position (Caldwell, NJ).
- Crisis reports are dynamically fetched or submitted and shown as markers.
- Each marker shows detailed information in a popup.
- The user can locate themselves, zoom the map, and interact with the reports list.

---

## 📸 Screenshots

| Map View | Report Popup |
|:---|:---|
| ![Map Screenshot](https://via.placeholder.com/500x300?text=Map+View) | ![Popup Screenshot](https://via.placeholder.com/500x300?text=Report+Details) |

(*Replace placeholder links with your real screenshots!*)

---

## 🚧 Future Improvements

- Add report submission form (with location picker)
- Real-time WebSocket updates for live crisis monitoring
- Cluster markers when zoomed out
- Auto-fit map bounds to all visible markers
- Add user authentication and roles (admin, volunteer, public)

---

## 🙌 Acknowledgements

- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [Lucide Icons](https://lucide.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📄 License

This project is licensed under the MIT License.  
Feel free to use and modify it for your own projects!

---

# 🚀 Let's make the world safer one marker at a time!
