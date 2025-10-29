'use client';

import Image from "next/image";

export default function Home() {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li>HOME</li>
            <li>CAFÉS</li>
            <li>MAP</li>
            <li>DELIVERY</li>
            <li>ABOUT</li>
          </ul>
        </nav>
        <button className="auth-btn">Log in / Sign up</button>
      </header>

      <section className="hero">
        <h1>SipLocal</h1>
        <h3>Your RGV Café Guide</h3>
        <p>
          Discover local coffee shops that reflect the heart and culture of your
          community. Explore menus, reviews, and hidden gems — brewed locally,
          just for you.
        </p>

        <div className="btn-group">
          <button className="primary-btn">Browse Cafés</button>
          <button className="secondary-btn">Log in / Sign up</button>
        </div>

        <div className="stats">
          <div>
            <span>+500</span>
            Local Customers
          </div>
          <div>
            <span>+250</span>
            Cafés Discovered
          </div>
        </div>
      </section>

      <style jsx global>{`
        :root { --hero: url('https://images.unsplash.com/photo-1509042239860-f550ce710b93'); }
        html, body { height: 100%; margin: 0; }
        body {
          background-color: white;
          background-image: var(--hero);
          background-repeat: no-repeat;
          background-position: right center;
          background-size: 50%, 100%;
          font-family: Arial, sans-serif;
          color: black;
        }
      `}</style>

      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 60px;
          background: rgba(0,0,0,0.4);
        }
        nav ul {
          list-style: none;
          display: flex;
          gap: 25px;
          padding: 0;
          margin: 0;
        }
        nav ul li {
          cursor: pointer;
          font-weight: 600;
        }
        .auth-btn {
          background: #c9965b;
          border: none;
          border-radius: 25px;
          padding: 10px 18px;
          cursor: pointer;
          color: black;
          font-weight: bold;
        }
        .hero {
          padding: 140px 60px;
          max-width: 600px;
        }
        .hero h1 {
          font-size: 64px;
          margin: 0 0 10px;
          font-weight: 900;
        }
        .hero p {
          max-width: 550px;
          line-height: 1.4;
        }
        .btn-group {
          margin-top: 20px;
          display: flex;
          gap: 20px;
        }
        .primary-btn, .secondary-btn {
          padding: 12px 26px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          border: 2px solid #c9965b;
        }
        .primary-btn { background: #c9965b; color: white; }
        .secondary-btn { background: transparent; color: black; }
        .stats {
          margin-top: 40px;
          display: flex;
          gap: 50px;
        }
        .stats div span {
          font-size: 28px;
          font-weight: bold;
          display: block;
        }
      `}</style>
    </>
  );
}
