import { Layout } from '../../components/Layout.js';
import { htmlResponse, jsonResponse, sanitizeString, normalizeWhatsApp } from '../../utils/html.js';
import { validateContact } from '../../utils/validators.js';
import DB from '../../services/database.js';

export async function handleContact(env, settings) {
  const content = `
    <!-- Hero -->
    <section class="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-primary-400 font-semibold text-sm tracking-wider uppercase animate-on-scroll">Contacto</span>
        <h1 class="text-4xl md:text-5xl font-bold text-white mt-4 mb-6 animate-on-scroll">Ponete en contacto</h1>
        <p class="text-gray-300 text-lg max-w-3xl mx-auto animate-on-scroll">Estamos para ayudarte. Consultanos por nuestros productos, precios o cualquier otra inquietud.</p>
      </div>
    </section>

    <!-- Contacto -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div class="lg:col-span-3 animate-fade-left">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">Envíanos un mensaje</h2>
            <form id="contact-form" class="space-y-6" novalidate>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                  <input type="text" id="name" name="name" required
                         class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                         placeholder="Tu nombre">
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Correo electrónico *</label>
                  <input type="email" id="email" name="email" required
                         class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                         placeholder="tu@email.com">
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input type="tel" id="phone" name="phone"
                         class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                         placeholder="+54 11 4567-8901">
                </div>
                <div>
                  <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                  <input type="text" id="subject" name="subject"
                         class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900"
                         placeholder="Ej: Consulta de precios">
                </div>
              </div>
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
                <textarea id="message" name="message" rows="5" required
                          class="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-gray-900 resize-y"
                          placeholder="Escribí tu mensaje..."></textarea>
              </div>
              <button type="submit"
                      class="btn-primary w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="inline-flex items-center">
                  Enviar mensaje
                  <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                </span>
              </button>
            </form>
            <div id="contact-toast" class="hidden mt-4"></div>
          </div>

          <div class="lg:col-span-2 animate-fade-right">
            <div class="bg-gray-50 rounded-2xl p-8 space-y-8">
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-6">Información de Contacto</h3>
                <div class="space-y-5">
                  ${settings.address ? `
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div><p class="font-medium text-gray-900">Dirección</p><p class="text-gray-600 text-sm mt-1">${settings.address}</p></div>
                  </div>` : ''}
                  ${settings.phone ? `
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <div><p class="font-medium text-gray-900">Teléfono</p><a href="tel:${settings.phone}" class="text-primary-600 hover:text-primary-700 text-sm mt-1 block">${settings.phone}</a></div>
                  </div>` : ''}
                  ${settings.email ? `
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div><p class="font-medium text-gray-900">Email</p><a href="mailto:${settings.email}" class="text-primary-600 hover:text-primary-700 text-sm mt-1 block">${settings.email}</a></div>
                  </div>` : ''}
                  ${settings.whatsapp ? `
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <div><p class="font-medium text-gray-900">WhatsApp</p><a href="https://wa.me/${normalizeWhatsApp(settings.whatsapp)}" target="_blank" class="text-green-600 hover:text-green-700 text-sm mt-1 block">+${normalizeWhatsApp(settings.whatsapp)}</a></div>
                  </div>` : ''}
                </div>
              </div>

              ${settings.schedule ? `
              <div class="border-t border-gray-200 pt-8">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Horarios</h3>
                <p class="text-gray-600 text-sm leading-relaxed">${settings.schedule}</p>
              </div>` : ''}

              <div class="border-t border-gray-200 pt-8">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Redes Sociales</h3>
                <div class="flex space-x-4">
                  ${[
                    { key: 'facebook', label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                    { key: 'instagram', label: 'Instagram', path: 'rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"' },
                    { key: 'linkedin', label: 'LinkedIn', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"' },
                    { key: 'youtube', label: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"' },
                  ].map(social => settings[social.key] ? `
                    <a href="${settings[social.key]}" target="_blank" rel="noopener noreferrer"
                       class="w-12 h-12 rounded-xl bg-gray-200 hover:bg-primary-600 flex items-center justify-center transition-all hover:scale-110 group" aria-label="${social.label}">
                      <svg class="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${social.path}"/></svg>
                    </a>
                  ` : '').join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mapa -->
    <section class="bg-gray-50">
      <div class="h-80 bg-gray-200 flex items-center justify-center">
        <div class="text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <p>Mapa interactivo — ${settings.address || 'Av. Industrial 1234'}</p>
        </div>
      </div>
    </section>

    <!-- Form handling script -->
    <script>
    document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button[type="submit"]');
      const toast = document.getElementById('contact-toast');

      btn.disabled = true;
      btn.innerHTML = '<span class="inline-flex items-center"><svg class="spinner w-5 h-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Enviando...</span>';

      const data = {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        subject: form.subject.value,
        message: form.message.value,
      };

      try {
        const res = await fetch('/api/contacto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        toast.className = 'mt-4 p-4 rounded-lg ' + (res.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800');
        toast.textContent = res.ok ? '¡Mensaje enviado con éxito! Te contactaremos pronto.' : (result.error || 'Error al enviar el mensaje.');
        toast.classList.remove('hidden');
        if (res.ok) form.reset();
      } catch {
        toast.className = 'mt-4 p-4 rounded-lg bg-red-50 text-red-800';
        toast.textContent = 'Error de conexión. Intentalo de nuevo.';
        toast.classList.remove('hidden');
      }

      btn.disabled = false;
      btn.innerHTML = '<span class="inline-flex items-center">Enviar mensaje<svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></span>';
      setTimeout(() => { toast.classList.add('hiding'); setTimeout(() => toast.classList.add('hidden'), 300); }, 5000);
    });
    </script>
  `;

  return htmlResponse(Layout({
    children: content,
    title: 'Contacto',
    description: 'Contactate con Molipar. Encontranos en nuestra dirección, teléfono, WhatsApp o mediante nuestro formulario de contacto.',
    settings,
    currentPath: '/contacto',
  }));
}

export async function handleContactSubmit(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ error: 'Datos inválidos' }, 400);
  }

  const errors = validateContact(data);
  if (errors.length > 0) {
    return jsonResponse({ error: errors.join('. ') }, 400);
  }

  const sanitized = {
    name: sanitizeString(data.name),
    email: sanitizeString(data.email),
    phone: sanitizeString(data.phone || ''),
    subject: sanitizeString(data.subject || ''),
    message: sanitizeString(data.message),
  };

  DB.setEnv(env);
  await DB.insert('contact_messages', sanitized);

  return jsonResponse({ success: true, message: 'Mensaje enviado correctamente' });
}
