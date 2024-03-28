import "../styles/globals.css";


//INTERAL IMPORT 
import { TrackingProvider } from "../Context/Tracking.js";
import { NavBar, Footer } from "../Components";

export default function App({ Component, pageProps }) {
  return (
    <>
      <TrackingProvider>
        <NavBar />
        <Component {...pageProps} />
      </TrackingProvider>
      <Footer />
    </>
  )
}
