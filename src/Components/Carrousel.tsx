import React, { useEffect, useState, useRef } from 'react';

const Carrousel: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('https://tests-enzo.distrial.com.ar/listFotosCombos.php')
      .then(res => res.json())
      .then(setImages)
      .catch(console.error);
  }, []);

  const scroll = (dir: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const thumb = carousel.querySelector('.thumbnail') as HTMLDivElement;
    if (!thumb) return;
    const gap = 16; // px
    const scrollAmt = thumb.offsetWidth + gap;
    carousel.scrollBy({ left: dir * scrollAmt, behavior: 'smooth' });
  };

  return (
    <div className="carousel-wrapper pt-32" style={{ position: 'relative' }}>
      <button
        className="btn-arrow prev"
        aria-label="Anterior"
        onClick={() => scroll(-1)}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          fontSize: '2rem',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '2.5rem',
          height: '3.5rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        ‹
      </button>
      <div
        className="carousel"
        ref={carouselRef}
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          padding: '1rem 3rem'
        }}
      >
        {images.map((src, i) => (
          <div
            className="thumbnail"
            key={i}
            style={{
              flex: '0 0 auto',
              width: '300px',
              height: '420px',
              overflow: 'hidden',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onClick={() => {
              setModalImg(src);
              setModalOpen(true);
            }}
          >
            <img
              src={src}
              alt={`Combo ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>
      <button
        className="btn-arrow next"
        aria-label="Siguiente"
        onClick={() => scroll(1)}
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          fontSize: '2rem',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '2.5rem',
          height: '3.5rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        ›
      </button>

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal open"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={e => {
            if ((e.target as HTMLElement).classList.contains('modal')) setModalOpen(false);
          }}
        >
          <button
            className="close"
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              fontSize: '2rem',
              color: 'white',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setModalOpen(false)}
          >
            &times;
          </button>
          <img
            src={modalImg}
            alt="Imagen ampliada"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '0.5rem',
              boxShadow: '0 0 1rem rgba(0,0,0,0.5)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Carrousel;