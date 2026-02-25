import Link from 'next/link';

export default function Home() {
  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="logo-container">
          <div className="logo-text">D<span>FITNESS</span> PLANET</div>
        </div>
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/admin" className="btn-secondary">Admin</Link>
          <Link href="/subscribe" className="btn-primary">Join Now</Link>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', position: 'relative', overflow: 'hidden' }}>

        {/* Background Image Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/gym-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          zIndex: -1
        }}></div>

        <div className="container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h1 className="hero-title animate-fade-in" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            TRANSFORM YOUR BODY,<br />
            ELEVATE YOUR LIFE.
          </h1>
          <p className="hero-subtitle animate-fade-in delay-1" style={{ margin: '0 auto 2rem auto' }}>
            Join the most premium fitness destination in Bangalore. Expert trainers, world-class equipment, and a community that pushes you further.
          </p>
          <div className="animate-fade-in delay-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/subscribe" className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.2rem' }}>Start Your Journey</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
