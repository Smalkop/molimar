import React, { useState, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
};

const staggerChildren = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const scaleFade = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
};

const cardVariants = {
  hidden: { x: 80, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  exit: { x: -100, opacity: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
};

const wipeReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } },
};

function SectionWipe({ children, className, animateOnMount = false }) {
  return (
    <motion.div
      className={className}
      variants={wipeReveal}
      initial="hidden"
      animate={animateOnMount ? 'visible' : undefined}
      whileInView={animateOnMount ? undefined : 'visible'}
      viewport={{ once: true, margin: '-60px' }}
      style={{ willChange: 'clip-path' }}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({ product, wa }) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
      style={{ willChange: 'transform, opacity' }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.main_image?.startsWith('http') || product.main_image?.startsWith('/') ? product.main_image : '/media/' + (product.main_image || '')}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">{product.type_name}</span>
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 text-xl mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.short_description || ''}</p>
        {product.presentations && product.presentations.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {product.presentations.map(p => (
              <span key={p.id} className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                {p.weight || p.name}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <a href={`/productos/${product.slug}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">Ver más</a>
          <a href={`https://wa.me/${wa || '595986288006'}?text=${encodeURIComponent('Hola, quiero información sobre ' + product.name)}`} target="_blank" className="text-green-600 hover:text-green-700 transition-colors" aria-label="WhatsApp">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function Catalog({ harinas = [], fideos = [], whatsapp = '' }) {
  const [activeTab, setActiveTab] = useState('harinas');
  const sectionRef = useRef(null);
  const primary = activeTab === 'harinas' ? harinas : fideos;
  const secondary = activeTab === 'harinas' ? fideos : harinas;
  const TABS = ['harinas', 'fideos'];
  const LABELS = { harinas: 'Harinas', fideos: 'Fideos' };

  function handleTab(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-12">
          <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Productos</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">Nuestros Productos</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Descubrí nuestra línea completa de harinas y fideos elaborados con los más altos estándares de calidad.</p>
        </motion.div>

        <div className="flex justify-center mb-12">
          <div className="relative inline-flex bg-gray-200 rounded-xl p-1">
            {TABS.map((tab) => (
              <motion.button key={tab} onClick={() => handleTab(tab)} className="relative z-10 px-8 py-3 text-sm font-semibold rounded-lg"
                style={{ color: activeTab === tab ? '#fff' : '#4b5563' }} whileTap={{ scale: 0.97 }}>
                {activeTab === tab && (
                  <motion.span layoutId="home-tab-indicator" className="absolute inset-1 bg-primary-600 rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                )}
                <span className="relative z-10">{LABELS[tab]}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {primary.length > 0 ? primary.map((p) => <ProductCard key={p.id} product={p} wa={whatsapp} />)
                : <div className="col-span-full text-center py-12 text-gray-500"><p>Próximamente nuevos productos</p></div>}
            </div>
            {secondary.length > 0 && (
              <div className="mt-16 pt-16 border-t border-gray-200">
                <h3 className="text-center text-lg font-semibold text-gray-700 mb-8">También te puede interesar</h3>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  {secondary.map((p) => <ProductCard key={p.id} product={p} wa={whatsapp} />)}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
          <a href="/productos" className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all">
            Ver todos los productos
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// --- Particle system for wheat grains in CTA background ---
function WheatParticles() {
  const grains = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        cx: 18 + Math.random() * 64,
        cy: 18 + Math.random() * 64,
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: 2 + Math.random() * 4,
        a: 1 + Math.random() * 1.5,
        d: 2 + Math.random() * 5,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {grains.map((g) => (
        <motion.svg
          key={g.id}
          className="absolute"
          style={{ left: g.x + '%', top: g.y + '%', width: 24, height: 24 }}
          animate={{
            x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60],
            y: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60],
            rotate: [0, 180 + Math.random() * 180, 360],
            opacity: [0.15, 0.45, 0.15],
          }}
          transition={{ duration: g.d * 2, repeat: Infinity, ease: 'easeInOut', delay: g.d * 0.5 }}
          viewBox="0 0 100 100"
          fill="rgba(255,255,255,0.3)"
        >
          <ellipse cx={g.cx} cy={g.cy} rx={g.r} ry={g.a * g.r} transform={`rotate(${g.r * 25}, ${g.cx}, ${g.cy})`} />
        </motion.svg>
      ))}
    </div>
  );
}

function Homepage() {
  const s = window.__SETTINGS__ || {};
  const harinas = window.__HARINAS__ || [];
  const fideos = window.__FIDEOS__ || [];
  const wa = window.__WHATSAPP__ || '595986288006';

  return (
    <>
      {/* Hero */}
      <SectionWipe animateOnMount={true} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.webp')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
                {s.hero_title || 'La calidad del trigo, el sabor de siempre'}
              </h1>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
              <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
                {s.hero_subtitle || 'Producimos harinas y fideos con los más altos estándares de calidad.'}
              </p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
              <a href="/productos" className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all">
                {s.hero_cta_text || 'Conocé nuestros productos'}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="/contacto" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 hover:border-white/50 text-white font-semibold rounded-lg transition-all hover:bg-white/10">Contactanos</a>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </SectionWipe>

      {/* Presentation */}
      <SectionWipe animateOnMount={true} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Sobre Nosotros</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">Tradición que se transforma en calidad</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{s.company_description || ''}</p>
              <p className="text-gray-600 leading-relaxed mb-8">{s.company_history ? s.company_history.substring(0, 300) + '...' : ''}</p>
              <a href="/nosotros" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group">
                Conocé más
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </motion.div>
            <motion.div variants={fadeRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="relative">
              <div className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/about-preview.webp" alt="Molipar S.A." className="w-full h-full object-cover" loading="lazy" />
              </div>
              <motion.div variants={scaleFade} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -left-6 bg-primary-600 text-white p-8 rounded-2xl shadow-xl hidden lg:block">
                <p className="text-4xl font-bold">+50</p>
                <p className="text-sm opacity-90">Años de experiencia</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </SectionWipe>

      {/* Catalog */}
      <Catalog harinas={harinas} fideos={fideos} whatsapp={wa} />

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Beneficios</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">¿Por qué elegir Molipar?</h2>
          </motion.div>
          <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'award', title: 'Calidad Superior', desc: 'Controles rigurosos en cada etapa del proceso productivo.' },
              { icon: 'truck', title: 'Distribución Eficiente', desc: 'Logística propia que garantiza entregas puntuales en todo el país.' },
              { icon: 'star', title: 'Materia Prima Seleccionada', desc: 'Solo los mejores granos de trigo de la región.' },
              { icon: 'shield', title: 'Certificaciones', desc: 'Procesos certificados que avalan nuestra calidad e inocuidad.' },
            ].map((b, i) => (
              <motion.div key={i} variants={scaleFade}
                className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100"
                whileHover={{ y: -4, borderColor: '#0000ba22', backgroundColor: '#fff', boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}>
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-2xl flex items-center justify-center">
                  {b.icon === 'award' && <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  {b.icon === 'truck' && <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m12 0V6a1 1 0 00-1-1h-2.161M21 14v3a1 1 0 01-1 1h-3m-6 0h6m-6 0a2 2 0 11-4 0m4 0a2 2 0 104 0" /></svg>}
                  {b.icon === 'star' && <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                  {b.icon === 'shield' && <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{b.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA with wheat floating particles */}
      <section className="py-24 bg-gradient-to-r from-primary-800 to-primary-700 relative overflow-hidden">
        <WheatParticles />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: "url('/images/pattern.svg')" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionWipe animateOnMount={true}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para trabajar con nosotros?</h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">Contactanos para conocer más sobre nuestros productos y cómo podemos ayudarte a hacer crecer tu negocio.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contacto" className="inline-flex items-center px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 font-semibold rounded-lg shadow-lg transition-all">
                Contactanos
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href={'https://wa.me/' + wa} target="_blank" className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </SectionWipe>
        </div>
      </section>
    </>
  );
}

try {
  const root = createRoot(document.getElementById('homepage-root'));
  root.render(<Homepage />);
} catch (error) {
  console.error('Error rendering homepage:', error);
}