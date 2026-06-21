<template>
  <div class="admin-page settings-page">
    <header class="page-header">
      <div>
        <span class="eyebrow">Configuration</span>
        <h1 class="page-header__title">Paramètres boutique</h1>
      </div>
      <button @click="save" :disabled="saving" class="btn btn-primary btn-sm">
        <span v-if="saving" class="spinner"></span>
        <span v-else>Enregistrer</span>
      </button>
    </header>

    <div v-if="loading" class="loader-wrap"><div class="loader"></div></div>

    <form v-else @submit.prevent="save" class="settings-form">

      <!-- Navigation par catégories -->
      <aside class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="settings-nav__item"
          :class="{ 'settings-nav__item--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="settings-nav__icon" v-html="tab.icon"></span>
          <span class="settings-nav__label">{{ tab.label }}</span>
        </button>
      </aside>

      <div class="settings-content">

      <!-- ── 1. Boutique ─────────────────────────────────────────── -->
      <section v-show="activeTab === 'shop'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#fce7f3;color:#be185d">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline stroke-linecap="round" points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h2>Informations boutique</h2>
            <p>Identité, coordonnées et présence de votre marque.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Nom de la boutique</label>
              <input v-model="form.shop_name" type="text" class="input" placeholder="Rosa Beauty Facial Care" />
            </div>
            <div class="field">
              <label class="label">Slogan</label>
              <input v-model="form.shop_tagline" type="text" class="input" placeholder="La beauté naturelle au quotidien" />
            </div>
          </div>

          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Email de contact</label>
              <div class="input-icon-wrap">
                <svg class="input-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input v-model="form.shop_email" type="email" class="input input--icon" placeholder="contact@rosabeauty.ci" />
              </div>
            </div>
            <div class="field">
              <label class="label">Téléphone principal</label>
              <div class="input-icon-wrap">
                <svg class="input-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <input v-model="form.shop_phone" type="text" class="input input--icon" placeholder="+225 07 00 00 00 00" />
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">Adresse physique</label>
            <input v-model="form.shop_address" type="text" class="input" placeholder="Cocody, Rue des Jardins, Abidjan" />
          </div>

          <div class="settings-grid-3">
            <div class="field">
              <label class="label">Ville</label>
              <input v-model="form.shop_city" type="text" class="input" placeholder="Abidjan" />
            </div>
            <div class="field">
              <label class="label">Pays</label>
              <AppSelect v-model="form.shop_country" :options="countryOptions" placeholder="Sélectionner…" />
            </div>
            <div class="field">
              <label class="label">Devise de base</label>
              <AppSelect v-model="form.shop_currency" :options="currencyOptions" />
            </div>
          </div>

          <label class="settings-toggle">
            <button type="button" @click="toggle('shop_currency_is_active')" class="toggle"
              :class="{ 'toggle--on': form.shop_currency_is_active === 'true' }">
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Afficher le sélecteur de devise (XOF / EUR)</strong>
              <span>Permet au client de basculer l'affichage des prix entre Franc CFA et Euro (parité fixe). Désactivé : la boutique reste dans la devise de base.</span>
            </div>
          </label>

          <div class="field">
            <label class="label">URL du logo</label>
            <div class="logo-field">
              <img v-if="form.shop_logo_url" :src="form.shop_logo_url" class="logo-preview" alt="Logo" @error="logoError = true" />
              <div v-if="!form.shop_logo_url || logoError" class="logo-placeholder">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M3 9h18M9 21V9"/></svg>
              </div>
              <input v-model="form.shop_logo_url" @input="logoError = false" type="url" class="input" placeholder="https://…/logo.png" />
            </div>
            <p class="hint">Format recommandé : PNG transparent, min. 200 × 80 px.</p>
          </div>
        </div>
      </section>

      <!-- ── 2. Légal ────────────────────────────────────────────── -->
      <section v-show="activeTab === 'legal'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#eff6ff;color:#1d4ed8">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <h2>Informations légales</h2>
            <p>Raison sociale, immatriculation et fiscalité.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Raison sociale</label>
              <input v-model="form.legal_company_name" type="text" class="input" placeholder="Rosa Beauty Facial Care SARL" />
            </div>
            <div class="field">
              <label class="label">Forme juridique</label>
              <AppSelect v-model="form.legal_form" :options="legalFormOptions" placeholder="Sélectionner…" />
            </div>
          </div>

          <div class="settings-grid-2">
            <div class="field">
              <label class="label">N° RCCM / Immatriculation</label>
              <input v-model="form.legal_registration" type="text" class="input" placeholder="CI-ABJ-2024-B-123456" />
            </div>
            <div class="field">
              <label class="label">N° Contribuable / TVA</label>
              <input v-model="form.legal_vat_number" type="text" class="input" placeholder="0123456789" />
            </div>
          </div>

          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Capital social</label>
              <input v-model="form.legal_capital" type="text" class="input" placeholder="1 000 000 XOF" />
            </div>
            <div class="field">
              <label class="label">Tribunal compétent</label>
              <input v-model="form.legal_court" type="text" class="input" placeholder="Tribunal de Commerce d'Abidjan" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── 3. Livraison ───────────────────────────────────────── -->
      <section v-show="activeTab === 'shipping'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#fef3c7;color:#b45309">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <rect x="1" y="3" width="15" height="13" rx="1" stroke-linecap="round"/><path stroke-linecap="round" d="M16 8h4l3 5v4h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            </svg>
          </div>
          <div>
            <h2>Livraison</h2>
            <p>Frais et conditions de livraison par défaut.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Frais de livraison standard</label>
              <div class="input-suffix-wrap">
                <input v-model.number="form.shipping_default_cost" type="number" min="0" class="input input--suffix" placeholder="2000" />
                <span class="input-suffix">{{ form.shop_currency || 'XOF' }}</span>
              </div>
            </div>
            <div class="field">
              <label class="label">Seuil livraison gratuite</label>
              <div class="input-suffix-wrap">
                <input v-model.number="form.shipping_free_threshold" type="number" min="0" class="input input--suffix" placeholder="25000" />
                <span class="input-suffix">{{ form.shop_currency || 'XOF' }}</span>
              </div>
              <p class="hint">0 = livraison jamais gratuite.</p>
            </div>
          </div>

          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Délai de livraison estimé</label>
              <input v-model="form.shipping_delay" type="text" class="input" placeholder="2 à 5 jours ouvrés" />
            </div>
            <div class="field">
              <label class="label">Zone(s) de livraison</label>
              <input v-model="form.shipping_zones" type="text" class="input" placeholder="Abidjan, Grand Abidjan, Yamoussoukro…" />
            </div>
          </div>

          <label class="settings-toggle">
            <button type="button" @click="toggle('shipping_pickup_enabled')" class="toggle" :class="{ 'toggle--on': form.shipping_pickup_enabled === 'true' }">
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Retrait en boutique disponible</strong>
              <span>Le client peut choisir de récupérer sa commande en boutique.</span>
            </div>
          </label>

          <label class="settings-toggle">
            <button type="button" @click="toggle('enable_quick_order')" class="toggle" :class="{ 'toggle--on': form.enable_quick_order === 'true' }">
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Commande rapide (sans compte)</strong>
              <span>Permet au client de passer commande avec juste nom + téléphone, sans créer de compte. Désactiver pour forcer la création de compte.</span>
            </div>
          </label>
        </div>
      </section>

      <!-- ── 4. Paiement ───────────────────────────────────────── -->
      <section v-show="activeTab === 'payment'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#f0fdf4;color:#15803d">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <rect x="1" y="4" width="22" height="16" rx="2"/><path stroke-linecap="round" d="M1 10h22"/>
            </svg>
          </div>
          <div>
            <h2>Moyens de paiement</h2>
            <p>Activez les méthodes de paiement proposées à la caisse.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div class="payment-methods">
            <label v-for="method in paymentMethods" :key="method.key" class="payment-method">
              <div class="payment-method__icon" :style="{ background: method.bg, color: method.color }">
                <span v-html="method.icon"></span>
              </div>
              <div class="payment-method__info">
                <strong>{{ method.label }}</strong>
                <span>{{ method.desc }}</span>
              </div>
              <button type="button" @click="toggle(method.key)" class="toggle toggle--sm" :class="{ 'toggle--on': form[method.key] === 'true' }">
                <span class="toggle__dot"></span>
              </button>
            </label>
          </div>

          <div class="field">
            <label class="label">Numéro mobile par défaut</label>
            <input v-model="form.payment_mobile_number" type="text" class="input" placeholder="07 00 00 00 00" />
            <p class="hint">Utilisé si aucun numéro spécifique n'est renseigné ci-dessous.</p>
          </div>

          <div class="settings-grid-2">
            <div class="field">
              <label class="label">Numéro Wave</label>
              <input v-model="form.payment_wave_number" type="text" class="input" placeholder="07 00 00 00 00" />
            </div>
            <div class="field">
              <label class="label">Numéro Orange Money</label>
              <input v-model="form.payment_orange_money_number" type="text" class="input" placeholder="07 00 00 00 00" />
            </div>
          </div>

          <div class="field">
            <label class="label">Numéro MTN MoMo</label>
            <input v-model="form.payment_mtn_number" type="text" class="input" placeholder="05 00 00 00 00" />
            <p class="hint">Affiché si MTN MoMo est activé ci-dessus.</p>
          </div>

          <div class="field">
            <label class="label">Instructions Wave <span class="hint">(affichées au client)</span></label>
            <textarea v-model="form.payment_wave_instructions" class="input textarea" rows="2" placeholder="Ouvrez Wave, envoyez le montant exact au numéro indiqué, puis confirmez via WhatsApp."></textarea>
          </div>
          <div class="field">
            <label class="label">Instructions Orange Money</label>
            <textarea v-model="form.payment_orange_money_instructions" class="input textarea" rows="2" placeholder="Composez #144#, envoyez le montant exact au numéro indiqué, puis confirmez via WhatsApp."></textarea>
          </div>
          <div class="field">
            <label class="label">Instructions MTN MoMo</label>
            <textarea v-model="form.payment_mtn_instructions" class="input textarea" rows="2" placeholder="Composez *133#, envoyez le montant exact au numéro indiqué, puis confirmez via WhatsApp."></textarea>
          </div>

          <label class="settings-toggle">
            <button type="button" @click="toggle('payment_geniuspay_enabled')" class="toggle" :class="{ 'toggle--on': form.payment_geniuspay_enabled === 'true' }">
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Paiement en ligne GeniusPay (Wave & Orange Money)</strong>
              <span>Si activé, Wave et Orange Money passent par GeniusPay : le client est redirigé vers une page de paiement sécurisée et la commande se confirme automatiquement. Sinon, paiement mobile manuel (numéro affiché ci-dessus).</span>
            </div>
          </label>
        </div>
      </section>

      <!-- ── 5. Réseaux sociaux ─────────────────────────────────── -->
      <section v-show="activeTab === 'social'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#fdf2f8;color:#9d174d">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path stroke-linecap="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
          </div>
          <div>
            <h2>Réseaux sociaux</h2>
            <p>Liens affichés dans le footer et les pages du site.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div v-for="social in socialNetworks" :key="social.key" class="field">
            <label class="label">
              <span class="social-icon" v-html="social.icon"></span>
              {{ social.label }}
            </label>
            <div class="input-icon-wrap">
              <svg class="input-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              <input v-model="form[social.key]" type="url" class="input input--icon" :placeholder="social.placeholder" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Page d'accueil ────────────────────────────────────── -->
      <section v-show="activeTab === 'home'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#fce8f0;color:#e8336d">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 9.5L12 3l9 6.5V21a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <h2>Page d'accueil</h2>
            <p>Bandeau hero, badges promo et label des ventes flash.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <!-- Style du hero (3 variantes) -->
          <div class="field">
            <label class="label">Style du hero d'accueil</label>
            <p class="hint">Choisissez la mise en page de la bannière d'accueil. Modifiable aussi en direct depuis la page d'accueil (connecté en admin).</p>
            <div class="hero-variant-grid">
              <button
                v-for="v in heroVariants"
                :key="v.value"
                type="button"
                class="hero-variant"
                :class="{ 'hero-variant--active': form.home_hero_variant === v.value }"
                @click="form.home_hero_variant = v.value"
              >
                <span class="hero-variant__preview" v-html="v.preview"></span>
                <span class="hero-variant__name">{{ v.label }}</span>
                <span class="hero-variant__desc">{{ v.desc }}</span>
              </button>
            </div>
          </div>

          <div class="field">
            <label class="label">Eyebrow du hero <span class="hint">(badge au-dessus du titre)</span></label>
            <input v-model="form.home_hero_eyebrow" type="text" class="input" placeholder="Nouveau · Collection Eau de Rose" maxlength="60" />
          </div>

          <div class="field">
            <label class="label">Titre principal du hero</label>
            <input v-model="form.home_hero_title" type="text" class="input" placeholder="La beauté naturelle révélée" maxlength="80" />
            <p class="hint">Laissez vide pour afficher le titre par défaut (avec « naturelle » en italique).</p>
          </div>

          <div class="field">
            <label class="label">Sous-titre du hero</label>
            <textarea v-model="form.home_hero_subtitle" class="input textarea" rows="2"
              placeholder="Des soins formulés à l'eau de rose pure pour illuminer votre peau au quotidien." maxlength="220"></textarea>
          </div>

          <div class="field">
            <label class="label">Photos du hero (carrousel)</label>
            <textarea v-model="form.home_hero_images" class="input textarea" rows="3"
              placeholder="/image_site/FLS_8032.jpeg&#10;/image_site/DSC_7553.jpeg&#10;https://.../photo.jpg"></textarea>
            <p class="hint">Une URL par ligne (ou séparées par des virgules). Ces photos défilent en fondu dans le cercle du hero. Laissez vide pour utiliser les photos par défaut.</p>
          </div>

          <div class="field">
            <label class="label">Label de la section ventes flash</label>
            <input v-model="form.home_flash_label" type="text" class="input" placeholder="Ventes flash" maxlength="40" />
          </div>

          <div class="field">
            <label class="label">Bandeau promo (en haut de la page)</label>
            <input v-model="form.home_promo_banner" type="text" class="input" placeholder="🌹 -20% sur tout · Code ROSA20" maxlength="120" />
            <p class="hint">Apparaît au-dessus de la navbar. Laissez vide pour masquer.</p>
          </div>

          <label class="settings-toggle">
            <button type="button" @click="toggle('announce_bar_enabled')" class="toggle" :class="{ 'toggle--on': form.announce_bar_enabled === 'true' }">
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Afficher la bande d'annonce</strong>
              <span>Active ou désactive la barre rose en haut du site (livraison offerte, paiements sécurisés, bandeau promo…).</span>
            </div>
          </label>
        </div>
      </section>

      <!-- ── 6. SEO ─────────────────────────────────────────────── -->
      <section v-show="activeTab === 'seo'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#f5f3ff;color:#6d28d9">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div>
            <h2>SEO & Méta</h2>
            <p>Titre et description par défaut pour les moteurs de recherche.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div class="field">
            <label class="label">Méta-titre par défaut</label>
            <input v-model="form.seo_meta_title" type="text" class="input" placeholder="Rosa Beauty Facial Care — Soins naturels à la rose pure" maxlength="60" />
            <div class="char-count">
              <div class="char-bar">
                <div class="char-bar__fill" :class="seoTitleClass" :style="{ width: Math.min(form.seo_meta_title?.length / 60 * 100, 100) + '%' }"></div>
              </div>
              <span>{{ form.seo_meta_title?.length ?? 0 }}/60</span>
            </div>
          </div>

          <div class="field">
            <label class="label">Méta-description par défaut</label>
            <textarea v-model="form.seo_meta_description" class="input textarea" rows="3"
              placeholder="Découvrez Rosa Beauty Facial Care, votre boutique de soins naturels à base d'eau de rose pure. Livraison rapide en Côte d'Ivoire." maxlength="160"></textarea>
            <div class="char-count">
              <div class="char-bar">
                <div class="char-bar__fill" :class="seoDescClass" :style="{ width: Math.min(form.seo_meta_description?.length / 160 * 100, 100) + '%' }"></div>
              </div>
              <span>{{ form.seo_meta_description?.length ?? 0 }}/160</span>
            </div>
          </div>

          <div class="field">
            <label class="label">Image Open Graph (réseaux sociaux)</label>
            <input v-model="form.seo_og_image" type="url" class="input" placeholder="https://…/og-image.jpg" />
            <p class="hint">Recommandé : 1200 × 630 px. Affichée lors d'un partage sur Facebook, Twitter…</p>
          </div>

          <!-- Google preview -->
          <div v-if="form.seo_meta_title || form.seo_meta_description" class="seo-preview">
            <p class="seo-preview__label">Aperçu Google</p>
            <div class="seo-preview__box">
              <p class="seo-preview__url">rosabeauty.ci › boutique</p>
              <p class="seo-preview__title">{{ form.seo_meta_title || form.shop_name || 'Rosa Beauty Facial Care' }}</p>
              <p class="seo-preview__desc">{{ form.seo_meta_description || '…' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 7. WhatsApp ───────────────────────────────────────── -->
      <section v-show="activeTab === 'whatsapp'" class="settings-section card">
        <div class="settings-section__head">
          <div class="settings-section__icon" style="background:#dcfce7;color:#16a34a">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <h2>WhatsApp</h2>
            <p>Notification de commandes et bouton client.</p>
          </div>
        </div>

        <div class="settings-section__body">
          <div class="field">
            <label class="label">Numéro WhatsApp de la boutique</label>
            <div class="input-icon-wrap">
              <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <input v-model="form.whatsapp_admin_number" type="text" class="input input--icon" placeholder="2250700000000" />
            </div>
            <p class="hint">Format international sans le +, ex : 2250701234567</p>
          </div>

          <label class="settings-toggle">
            <button type="button" @click="toggle('whatsapp_notify_customer')" class="toggle" :class="{ 'toggle--on': form.whatsapp_notify_customer === 'true' }">
              <span class="toggle__dot"></span>
            </button>
            <div class="settings-toggle__text">
              <strong>Afficher le bouton WhatsApp au client</strong>
              <span>Le client voit un bouton pour envoyer sa commande depuis la page de confirmation.</span>
            </div>
          </label>
        </div>
      </section>

      <!-- ── Actions ───────────────────────────────────────────── -->
      <div class="settings-actions">
        <button type="submit" :disabled="saving" class="btn btn-primary settings-save-btn">
          <span v-if="saving" class="spinner"></span>
          <template v-else>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Enregistrer les paramètres</span>
          </template>
        </button>
        <p v-if="success" class="msg msg--success">✓ Paramètres enregistrés avec succès.</p>
        <p v-if="errorMsg" class="msg msg--error">{{ errorMsg }}</p>
      </div>
      </div><!-- /.settings-content -->
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const loading  = ref(true)
const saving   = ref(false)
const success  = ref(false)
const errorMsg = ref('')
const logoError = ref(false)

// ── Navigation par catégories ──────────────────────────────────────────────
const activeTab = ref('shop')
const tabs = [
  { id: 'shop',     label: 'Boutique',  icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline stroke-linecap="round" points="9 22 9 12 15 12 15 22"/></svg>' },
  { id: 'legal',    label: 'Légal',     icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>' },
  { id: 'shipping', label: 'Livraison', icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path stroke-linecap="round" d="M16 8h4l3 5v4h-7V8z"/></svg>' },
  { id: 'payment',  label: 'Paiement',  icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><path stroke-linecap="round" d="M1 10h22"/></svg>' },
  { id: 'social',   label: 'Réseaux',   icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path stroke-linecap="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>' },
  { id: 'home',     label: 'Accueil',   icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path d="M3 9.5L12 3l9 6.5V21a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id: 'seo',      label: 'SEO',       icon: '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/></svg>' },
  { id: 'whatsapp', label: 'WhatsApp',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.739-.981z"/></svg>' },
]

const form = ref({
  // Boutique
  shop_name:        '',
  shop_tagline:     '',
  shop_email:       '',
  shop_phone:       '',
  shop_address:     '',
  shop_city:        '',
  shop_country:     '',
  shop_logo_url:    '',
  shop_currency:    'XOF',
  shop_currency_is_active: 'false',
  // Légal
  legal_company_name: '',
  legal_form:         '',
  legal_registration: '',
  legal_vat_number:   '',
  legal_capital:      '',
  legal_court:        '',
  // Livraison
  shipping_default_cost:    '',
  shipping_free_threshold:  '',
  shipping_delay:           '',
  shipping_zones:           '',
  shipping_pickup_enabled:  'false',
  // Paiement
  payment_wave_enabled:          'true',
  payment_orange_money_enabled:  'true',
  payment_mtn_enabled:           'false',
  payment_delivery_enabled:      'true',
  payment_stripe_enabled:        'false',
  payment_mobile_number:         '',
  payment_wave_number:           '',
  payment_orange_money_number:   '',
  payment_mtn_number:            '',
  payment_wave_instructions:         '',
  payment_orange_money_instructions: '',
  payment_mtn_instructions:          '',
  payment_geniuspay_enabled:     'false',
  // Tunnel de commande
  enable_quick_order:            'true',
  // Réseaux sociaux
  social_instagram: '',
  social_facebook:  '',
  social_tiktok:    '',
  social_youtube:   '',
  social_twitter:   '',
  social_pinterest: '',
  // SEO
  seo_meta_title:       '',
  seo_meta_description: '',
  seo_og_image:         '',
  // Page d'accueil
  home_hero_eyebrow:    '',
  home_hero_title:      '',
  home_hero_subtitle:   '',
  home_hero_images:     '',
  home_flash_label:     'Ventes flash',
  home_promo_banner:    '',
  announce_bar_enabled: 'true',
  home_hero_variant:    '1',
  // WhatsApp
  whatsapp_admin_number:    '',
  whatsapp_notify_customer: 'false',
})

const heroVariants = [
  {
    value: '1',
    label: 'Plein écran',
    desc: 'Photo immersive, texte clair par-dessus',
    preview: `<svg viewBox="0 0 80 48" fill="none"><rect width="80" height="48" rx="4" fill="#2a161e"/><rect x="8" y="20" width="34" height="5" rx="2.5" fill="#fff"/><rect x="8" y="29" width="22" height="4" rx="2" fill="#ffd9e4"/><rect x="8" y="37" width="16" height="4" rx="2" fill="#e8336d"/></svg>`,
  },
  {
    value: '2',
    label: 'Split',
    desc: 'Texte à gauche, visuel en arche à droite',
    preview: `<svg viewBox="0 0 80 48" fill="none"><rect width="80" height="48" rx="4" fill="#fdeef2"/><rect x="8" y="14" width="26" height="4" rx="2" fill="#c0386b"/><rect x="8" y="22" width="20" height="4" rx="2" fill="#2a1f24"/><rect x="8" y="32" width="14" height="4" rx="2" fill="#e8336d"/><path d="M50 12c8 0 14 6 14 14v10H50V12z" fill="#f8a8b8"/></svg>`,
  },
  {
    value: '3',
    label: 'Classique',
    desc: 'Bannière centrée + bande de réassurance',
    preview: `<svg viewBox="0 0 80 48" fill="none"><rect width="80" height="40" rx="4" fill="#2a161e"/><rect x="24" y="12" width="32" height="5" rx="2.5" fill="#fff"/><rect x="30" y="21" width="20" height="4" rx="2" fill="#ffd9e4"/><rect x="32" y="40" width="80" height="8" fill="#e8336d"/><rect y="40" width="80" height="8" fill="#e8336d"/></svg>`,
  },
  {
    value: '4',
    label: 'Best-sellers',
    desc: 'Texte + photo + 2 produits phares à droite',
    preview: `<svg viewBox="0 0 80 48" fill="none"><rect width="80" height="48" rx="4" fill="#fdeef2"/><rect x="6" y="14" width="20" height="4" rx="2" fill="#2a1f24"/><rect x="6" y="22" width="14" height="3" rx="1.5" fill="#e8336d"/><rect x="34" y="10" width="16" height="28" rx="6" fill="#f8a8b8"/><rect x="56" y="12" width="20" height="9" rx="2" fill="#fff"/><rect x="56" y="26" width="20" height="9" rx="2" fill="#fff"/></svg>`,
  },
  {
    value: '5',
    label: 'Vitrine',
    desc: 'Texte + icônes de réassurance + grande photo',
    preview: `<svg viewBox="0 0 80 48" fill="none"><rect width="80" height="40" rx="4" fill="#fff"/><rect x="6" y="10" width="22" height="4" rx="2" fill="#2a1f24"/><circle cx="9" cy="22" r="3" fill="#ffd6e7"/><circle cx="17" cy="22" r="3" fill="#ffd6e7"/><circle cx="25" cy="22" r="3" fill="#ffd6e7"/><rect x="42" y="8" width="32" height="26" rx="3" fill="#f8a8b8"/><rect y="40" width="80" height="8" fill="#fff0f5"/></svg>`,
  },
]

const paymentMethods = [
  { key: 'payment_wave_enabled',         label: 'Wave',                  desc: 'Paiement mobile Wave',           bg: '#e0f2fe', color: '#0369a1', icon: '🌊' },
  { key: 'payment_orange_money_enabled', label: 'Orange Money',          desc: 'Paiement mobile Orange',         bg: '#fff7ed', color: '#c2410c', icon: '🍊' },
  { key: 'payment_mtn_enabled',          label: 'MTN MoMo',              desc: 'MTN Mobile Money',               bg: '#fefce8', color: '#a16207', icon: '🟡' },
  { key: 'payment_delivery_enabled',     label: 'Paiement à la livraison', desc: 'Le client paie à la réception', bg: '#f0fdf4', color: '#15803d', icon: '🏠' },
  { key: 'payment_stripe_enabled',       label: 'Carte bancaire (Stripe)', desc: 'Visa, Mastercard — sécurisé',  bg: '#f5f3ff', color: '#6d28d9', icon: '💳' },
]

const socialNetworks = [
  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/rosabeauty',  icon: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
  { key: 'social_facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/rosabeauty',   icon: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
  { key: 'social_tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@rosabeauty',    icon: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.84 1.56V6.81a4.85 4.85 0 01-1.07-.12z"/></svg>' },
  { key: 'social_youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@rosabeauty',   icon: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>' },
  { key: 'social_twitter',   label: 'X (Twitter)', placeholder: 'https://x.com/rosabeauty',        icon: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  { key: 'social_pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/rosabeauty',  icon: '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>' },
]

const countryOptions = [
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'SN', label: 'Sénégal' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'GN', label: 'Guinée' },
  { value: 'TG', label: 'Togo' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'CM', label: 'Cameroun' },
  { value: 'GA', label: 'Gabon' },
  { value: 'CG', label: 'Congo' },
  { value: 'CD', label: 'RD Congo' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
]

const currencyOptions = [
  { value: 'XOF', label: 'XOF — Franc CFA' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'USD', label: 'USD — Dollar' },
  { value: 'GNF', label: 'GNF — Franc guinéen' },
  { value: 'MAD', label: 'MAD — Dirham' },
]

const legalFormOptions = [
  { value: 'SARL', label: 'SARL' },
  { value: 'SAS',  label: 'SAS' },
  { value: 'SA',   label: 'SA' },
  { value: 'EI',   label: 'Entreprise Individuelle' },
  { value: 'EURL', label: 'EURL' },
  { value: 'Auto-entrepreneur', label: 'Auto-entrepreneur' },
  { value: 'Association',       label: 'Association' },
]

const seoTitleClass = computed(() => {
  const l = form.value.seo_meta_title?.length ?? 0
  return l > 60 ? 'char-bar__fill--red' : l > 50 ? 'char-bar__fill--orange' : 'char-bar__fill--green'
})
const seoDescClass = computed(() => {
  const l = form.value.seo_meta_description?.length ?? 0
  return l > 160 ? 'char-bar__fill--red' : l > 140 ? 'char-bar__fill--orange' : 'char-bar__fill--green'
})

function toggle(key) {
  form.value[key] = form.value[key] === 'true' ? 'false' : 'true'
}

async function fetchSettings() {
  try {
    const { data } = await api.get('/admin/settings')
    // Hydrater le formulaire avec toutes les clés disponibles
    Object.keys(form.value).forEach(key => {
      if (data[key] !== undefined) form.value[key] = data[key]
    })
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value  = true
  success.value = false
  errorMsg.value = ''
  try {
    await api.put('/admin/settings', { settings: form.value })
    success.value = true
    setTimeout(() => { success.value = false }, 4000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message ?? 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; gap: var(--space-5); max-width: 1040px; }
.settings-form { display: grid; grid-template-columns: 220px 1fr; gap: var(--space-6); align-items: start; }
.settings-content { display: flex; flex-direction: column; gap: var(--space-5); min-width: 0; }

/* ── Navigation par catégories ── */
.settings-nav {
  position: sticky;
  top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #fff;
  border: 1px solid var(--cream-200);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
}
.settings-nav__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 12px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--gray-600);
  text-align: left;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.settings-nav__item:hover { background: var(--cream-50); color: var(--gray-800); }
.settings-nav__item--active { background: var(--rose-50); color: var(--rose-600); font-weight: 600; }
.settings-nav__icon { display: inline-flex; flex-shrink: 0; }
.settings-nav__icon :deep(svg) { display: block; }

@media (max-width: 860px) {
  .settings-form { grid-template-columns: 1fr; }
  .settings-nav {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    gap: 4px;
    -webkit-overflow-scrolling: touch;
  }
  .settings-nav__item { white-space: nowrap; }
}

/* Section */
.settings-section { padding: 0; overflow: hidden; }
.settings-section__head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--cream-200);
}
.settings-section__icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.settings-section__head h2 { font-size: 1rem; font-weight: 600; color: var(--gray-800); }
.settings-section__head p  { font-size: 0.8125rem; color: var(--gray-500); margin-top: 2px; }
.settings-section__body    { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }

/* Grilles */
.settings-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.settings-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }
@media (max-width: 640px) {
  .settings-grid-2, .settings-grid-3 { grid-template-columns: 1fr; }
}

.field { display: flex; flex-direction: column; gap: 6px; }
.hint  { font-size: 0.75rem; color: var(--gray-400); }
.textarea { resize: vertical; min-height: 80px; font-family: inherit; }

/* Input avec icône */
.input-icon-wrap { position: relative; }
.input-icon {
  position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
  color: var(--gray-400); pointer-events: none;
}
.input--icon { padding-left: 36px; }

/* Input avec suffix */
.input-suffix-wrap { display: flex; }
.input--suffix { border-radius: var(--radius-md) 0 0 var(--radius-md); border-right: none; }
.input-suffix {
  padding: 0 12px;
  height: 40px;
  display: flex; align-items: center;
  background: var(--cream-100);
  border: 1.5px solid var(--cream-300);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: 0.8125rem;
  color: var(--gray-500);
  white-space: nowrap;
}

/* Logo */
.logo-field { display: flex; align-items: center; gap: var(--space-3); }
.logo-preview { height: 44px; max-width: 120px; object-fit: contain; border: 1px solid var(--cream-200); border-radius: var(--radius-md); padding: 4px; background: #fff; }
.logo-placeholder { width: 44px; height: 44px; border: 1.5px dashed var(--cream-300); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--gray-300); flex-shrink: 0; }

/* Toggle */
.settings-toggle {
  display: flex; align-items: flex-start; gap: var(--space-4);
  padding: var(--space-4);
  background: var(--cream-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--cream-200);
  cursor: pointer;
}
.settings-toggle__text { flex: 1; }
.settings-toggle__text strong { display: block; font-size: 0.875rem; color: var(--gray-800); margin-bottom: 2px; }
.settings-toggle__text span   { font-size: 0.75rem; color: var(--gray-500); line-height: 1.5; }
.toggle {
  width: 44px; height: 24px; border-radius: 12px;
  background: var(--cream-300);
  position: relative; flex-shrink: 0;
  transition: background var(--transition-fast); cursor: pointer; border: none;
}
.toggle--sm { width: 36px; height: 20px; border-radius: 10px; }
.toggle--on { background: var(--rose-400); }
.toggle__dot {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
  display: block;
}
.toggle--sm .toggle__dot { width: 14px; height: 14px; }
.toggle--on .toggle__dot { transform: translateX(20px); }
.toggle--sm.toggle--on .toggle__dot { transform: translateX(16px); }

/* Paiement */
.payment-methods { display: flex; flex-direction: column; gap: var(--space-3); }
.payment-method {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4);
  border: 1.5px solid var(--cream-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}
.payment-method:hover { border-color: var(--rose-200); }
.payment-method__icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
.payment-method__info { flex: 1; }
.payment-method__info strong { display: block; font-size: 0.875rem; color: var(--gray-800); }
.payment-method__info span   { font-size: 0.75rem; color: var(--gray-500); }

/* Réseaux sociaux */
.social-icon { display: inline-flex; vertical-align: middle; margin-right: 6px; color: var(--gray-600); }

/* SEO */
.char-count { display: flex; align-items: center; gap: var(--space-2); margin-top: 4px; }
.char-bar   { flex: 1; height: 4px; background: var(--cream-200); border-radius: 2px; overflow: hidden; }
.char-bar__fill { height: 100%; border-radius: 2px; transition: width 0.2s, background 0.2s; }
.char-bar__fill--green  { background: #22c55e; }
.char-bar__fill--orange { background: #f97316; }
.char-bar__fill--red    { background: #ef4444; }
.char-count span { font-size: 0.7rem; color: var(--gray-400); white-space: nowrap; }

.seo-preview { background: var(--cream-50); border: 1px solid var(--cream-200); border-radius: var(--radius-md); padding: var(--space-4); }
.seo-preview__label { font-size: 0.7rem; font-weight: 500; color: var(--gray-400); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: var(--space-2); }
.seo-preview__url    { font-size: 0.75rem; color: #1a6f1a; margin-bottom: 2px; }
.seo-preview__title  { font-size: 1rem; color: #1a0dab; font-weight: 400; margin-bottom: 2px; }
.seo-preview__title:hover { text-decoration: underline; cursor: pointer; }
.seo-preview__desc   { font-size: 0.8125rem; color: #4d5156; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Actions */
.settings-actions {
  display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap;
  padding: var(--space-4) 0;
}
.msg { font-size: 0.875rem; }
.msg--success { color: #15803d; font-weight: 500; }
.msg--error   { color: #b91c1c; }

/* Spinner */
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Sélecteur de style hero ── */
.hero-variant-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}
.hero-variant {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1.5px solid var(--cream-300, #e7e0db);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}
.hero-variant:hover { border-color: var(--rose-300, #f8a8b8); }
.hero-variant--active {
  border-color: var(--rose-500, #e8336d);
  box-shadow: 0 0 0 3px rgba(232, 51, 109, 0.12);
}
.hero-variant__preview {
  display: block;
  border-radius: 6px;
  overflow: hidden;
  line-height: 0;
}
.hero-variant__preview :deep(svg) { width: 100%; height: auto; display: block; }
.hero-variant__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-800, #2a1f24);
}
.hero-variant__desc {
  font-size: 0.6875rem;
  color: var(--gray-500, #78716c);
  line-height: 1.4;
}
@media (max-width: 640px) {
  .hero-variant-grid { grid-template-columns: 1fr; }
}

/* Bouton enregistrer : icône + texte alignés et centrés */
.settings-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.settings-save-btn svg { flex-shrink: 0; }
</style>
