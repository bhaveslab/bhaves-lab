import { useEffect } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";

const volumes = [
  {
    collection: "THE GOSPEL",
    books: [
      {
        number: "01",
        title: "The Gospel: Lost Chapters",
        subtitle: "The original work",
        detail: "Digital ebook · Edition file to be verified",
        price: null,
      },
      {
        number: "02",
        title: "The Gospel: Lost Chapters — Study Guide",
        subtitle: "A companion to the original work",
        detail: "Digital study guide · Edition in preparation",
        price: null,
      },
    ],
  },
  {
    collection: "THE POSSIBILITY",
    books: [
      {
        number: "01",
        title: "The Possibility",
        subtitle: "Life Is Already in Motion",
        detail: "Digital ebook · English and Spanish editions",
        price: "$9.99",
      },
      {
        number: "02",
        title: "The Possibility Game",
        subtitle: "30 Days to a Possible Reality — and Beyond",
        detail: "Digital guide · 30 missions + unlimited self-created missions",
        price: "$9.99",
      },
    ],
  },
] as const;

export function Library() {
  useEffect(() => {
    document.title = "Digital Library — BHAVÉ’S LAB";
  }, []);

  return (
    <div className="observatory library-world">
      <a className="lab-skip" href="#library-main">Skip to library</a>
      <header className="library-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/">← The Observatory</Link>
      </header>
      <main id="library-main" className="library-main">
        <p className="lab-kicker">ORIGINAL PUBLICATIONS / DIGITAL EDITIONS</p>
        <h1>The <em>Library.</em></h1>
        <p className="library-lede">
          Words to explore. Guides to carry into your own experience.
          Nothing to become. Nothing to prove.
        </p>
        <p className="library-format">EBOOKS ONLY · DIGITAL DOWNLOADS</p>
        {volumes.map((volume) => (
          <section className="library-shelf" key={volume.collection} aria-label={volume.collection}>
            <div className="library-shelf-heading">
              <p className="lab-kicker">COLLECTION</p>
              <h2>{volume.collection}</h2>
            </div>
            <div className="library-grid">
              {volume.books.map((book) => (
                <article className="library-book" key={book.title}>
                  <div className="library-book-art" aria-hidden="true">
                    <span>BHAVÉ’S LAB</span>
                    <span className="library-art-mark">◌</span>
                    <strong>{book.title}</strong>
                    <small>BHAVÉ</small>
                  </div>
                  <div className="library-book-copy">
                    <p className="library-volume">VOLUME {book.number}</p>
                    <h3>{book.title}</h3>
                    <p className="library-subtitle">{book.subtitle}</p>
                    <p className="library-detail">{book.detail}</p>
                    <p className="library-availability">
                      {book.price ? <><strong>{book.price}</strong> · </> : null}
                      Purchase links will appear after secure delivery is verified.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <p className="library-closing">
          Life is already in motion. <em>The possibilities are endless.</em>
        </p>
        <Link to="/" className="library-back">Return to the Observatory ↑</Link>
      </main>
      <footer className="lab-footer">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        <span>© {new Date().getFullYear()} Bhavé’s Lab</span>
      </footer>
    </div>
  );
}
