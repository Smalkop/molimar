import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
  },
};

const cardVariants = {
  hidden: { x: 80, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
  },
};

function ProductCard({ product, wa }) {
  return (
    <motion.div
      variants={cardVariants}
      className="product-card bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 card-hover"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.main_image?.startsWith('http') || product.main_image?.startsWith('/') ? product.main_image : '/media/' + (product.main_image || '')}
          alt={product.name}
          className="card-image w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
          {product.type_name}
        </span>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 text-xl mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.short_description || ''}</p>
        <div className="flex items-center justify-between">
          <a href={`/productos/${product.slug}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">Ver más</a>
          <a
            href={`https://wa.me/${wa || '595986288006'}?text=${encodeURIComponent('Hola, quiero información sobre ' + product.name)}`}
            target="_blank"
            className="text-green-600 hover:text-green-700 transition-colors"
            aria-label="WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function Catalog({ harinas, fideos, whatsapp }) {
  const [activeTab, setActiveTab] = useState('harinas');
  const sectionRef = useRef(null);

  const primary = activeTab === 'harinas' ? harinas : fideos;
  const secondary = activeTab === 'harinas' ? fideos : harinas;

  function handleTab(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const TABS = ['harinas', 'fideos'];
  const TABS_LABEL = { harinas: 'Harinas', fideos: 'Fideos' };

  return (
    <section id="catalog-root" ref={sectionRef} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Productos</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Nuestros Productos</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Descubrí nuestra línea completa de harinas y fideos elaborados con los más altos estándares de calidad.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="relative inline-flex bg-gray-200 rounded-xl p-1">
            {TABS.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => handleTab(tab)}
                className="relative z-10 px-8 py-3 text-sm font-semibold rounded-lg"
                style={{ color: activeTab === tab ? '#fff' : '#4b5563' }}
                whileTap={{ scale: 0.97 }}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-1 bg-primary-600 rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{TABS_LABEL[tab]}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden" style={{ minHeight: '420px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {primary.length > 0 ? (
                  primary.map((p) => (
                    <ProductCard key={p.id} product={p} wa={whatsapp} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <p>Próximamente nuevos productos</p>
                  </div>
                )}
              </div>

              {secondary.length > 0 && (
                <div className="mt-16 pt-16 border-t border-gray-200">
                  <h3 className="text-center text-lg font-semibold text-gray-700 mb-8">
                    También te puede interesar
                  </h3>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {secondary.map((p) => (
                      <ProductCard key={p.id} product={p} wa={whatsapp} />
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-center mt-12">
          <a
            href="/productos"
            className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            Ver todos los productos
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

const root = createRoot(document.getElementById('catalog-root'));
root.render(<Catalog harinas={window.__HARINAS__ || []} fideos={window.__FIDEOS__ || []} whatsapp={window.__WHATSAPP__ || ''} />);