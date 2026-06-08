import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  validatePlatformLinks,
  validateRestaurantForm,
} from '../lib/restaurantValidation';
import {
  DELIVERY_PLATFORMS,
  formatList,
  mapToLinkRows,
  linksToMap,
  parseList,
  RESERVATION_PLATFORMS,
  VERIFICATION_STATUSES,
  type PlatformLink,
  type RestaurantDetail,
} from '../types/restaurant';

type FormState = {
  name: string;
  slug: string;
  country_code: string;
  region_code: string;
  region_name: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  address_street: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  apple_maps_url: string;
  venue_type: string;
  cuisine_types: string;
  price_range: string;
  meal_types: string;
  verification_status: string;
  verification_methods: string;
  last_verified_at: string;
  face_program: boolean;
  aoecs_certified: boolean;
  national_authority: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  menu_url: string;
  instagram: string;
  facebook: string;
  opening_hours: string;
  seasonal_closure: string;
  description_es: string;
  description_en: string;
  description_de: string;
  featured_image_url: string;
  is_published: boolean;
  is_hidden: boolean;
  is_premium_partner: boolean;
};

function fromRow(row: RestaurantDetail): FormState {
  return {
    name: row.name,
    slug: row.slug ?? '',
    country_code: row.country_code,
    region_code: row.region_code,
    region_name: row.region_name,
    province: row.province ?? '',
    city: row.city,
    district: row.district ?? '',
    postal_code: row.postal_code ?? '',
    address_street: row.address_street ?? '',
    latitude: row.latitude != null ? String(row.latitude) : '',
    longitude: row.longitude != null ? String(row.longitude) : '',
    google_maps_url: row.google_maps_url ?? '',
    apple_maps_url: row.apple_maps_url ?? '',
    venue_type: row.venue_type ?? '',
    cuisine_types: formatList(row.cuisine_types),
    price_range: row.price_range ?? '',
    meal_types: formatList(row.meal_types),
    verification_status: row.verification_status,
    verification_methods: formatList(row.verification_methods),
    last_verified_at: row.last_verified_at ?? '',
    face_program: row.face_program ?? false,
    aoecs_certified: row.aoecs_certified ?? false,
    national_authority: row.national_authority ?? '',
    phone: row.phone ?? '',
    whatsapp: row.whatsapp ?? '',
    email: row.email ?? '',
    website: row.website ?? '',
    menu_url: row.menu_url ?? '',
    instagram: row.instagram ?? '',
    facebook: row.facebook ?? '',
    opening_hours: row.opening_hours ?? '',
    seasonal_closure: row.seasonal_closure ?? '',
    description_es: row.description_es ?? '',
    description_en: row.description_en ?? '',
    description_de: row.description_de ?? '',
    featured_image_url: row.featured_image_url ?? '',
    is_published: row.is_published,
    is_hidden: row.is_hidden,
    is_premium_partner: row.is_premium_partner ?? false,
  };
}

function toPayload(form: FormState) {
  const num = (v: string) => (v.trim() === '' ? null : Number(v));
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || null,
    country_code: form.country_code.trim() || 'ES',
    region_code: form.region_code.trim(),
    region_name: form.region_name.trim(),
    province: form.province.trim() || null,
    city: form.city.trim(),
    district: form.district.trim() || null,
    postal_code: form.postal_code.trim() || null,
    address_street: form.address_street.trim() || null,
    latitude: num(form.latitude),
    longitude: num(form.longitude),
    google_maps_url: form.google_maps_url.trim() || null,
    apple_maps_url: form.apple_maps_url.trim() || null,
    venue_type: form.venue_type.trim() || null,
    cuisine_types: parseList(form.cuisine_types),
    price_range: form.price_range.trim() || null,
    meal_types: parseList(form.meal_types),
    verification_status: form.verification_status,
    verification_methods: parseList(form.verification_methods),
    last_verified_at: form.last_verified_at.trim() || null,
    face_program: form.face_program,
    aoecs_certified: form.aoecs_certified,
    national_authority: form.national_authority.trim() || null,
    phone: form.phone.trim() || null,
    whatsapp: form.whatsapp.trim() || null,
    email: form.email.trim() || null,
    website: form.website.trim() || null,
    menu_url: form.menu_url.trim() || null,
    instagram: form.instagram.trim() || null,
    facebook: form.facebook.trim() || null,
    opening_hours: form.opening_hours.trim() || null,
    seasonal_closure: form.seasonal_closure.trim() || null,
    description_es: form.description_es.trim() || null,
    description_en: form.description_en.trim() || null,
    description_de: form.description_de.trim() || null,
    featured_image_url: form.featured_image_url.trim() || null,
    is_published: form.is_published,
    is_hidden: form.is_hidden,
    is_premium_partner: form.is_premium_partner,
  };
}

async function savePlatformLinks(
  restaurantId: string,
  table: 'delivery_links' | 'reservation_links',
  links: PlatformLink[],
) {
  for (const link of links) {
    const url = link.url.trim();
    if (!url) {
      await supabase
        .from(table)
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('platform', link.platform);
      continue;
    }
    const { error } = await supabase.from(table).upsert(
      {
        restaurant_id: restaurantId,
        platform: link.platform,
        url,
        is_active: link.is_active,
      },
      { onConflict: 'restaurant_id,platform' },
    );
    if (error) throw error;
  }
}

function LinkFields({
  title,
  links,
  onChange,
}: {
  title: string;
  links: PlatformLink[];
  onChange: (next: PlatformLink[]) => void;
}) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      {links.map((link, index) => (
        <div key={link.platform} className="link-row">
          <label className="link-label">{link.platform}</label>
          <input
            type="url"
            placeholder="https://…"
            value={link.url}
            onChange={(e) => {
              const next = [...links];
              next[index] = { ...link, url: e.target.value };
              onChange(next);
            }}
          />
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={link.is_active}
              onChange={(e) => {
                const next = [...links];
                next[index] = { ...link, is_active: e.target.checked };
                onChange(next);
              }}
            />
            aktiv
          </label>
        </div>
      ))}
    </fieldset>
  );
}

export default function RestaurantEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [deliveryLinks, setDeliveryLinks] = useState<PlatformLink[]>([]);
  const [reservationLinks, setReservationLinks] = useState<PlatformLink[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      supabase.from('restaurants').select('*').eq('id', id).single(),
      supabase.from('delivery_links').select('platform,url,is_active').eq('restaurant_id', id),
      supabase.from('reservation_links').select('platform,url,is_active').eq('restaurant_id', id),
    ]).then(([restaurantRes, deliveryRes, reservationRes]) => {
      if (restaurantRes.error) {
        setError(restaurantRes.error.message);
        setLoading(false);
        return;
      }
      const row = restaurantRes.data as RestaurantDetail;
      setForm(fromRow(row));

      const dMap = linksToMap((deliveryRes.data as PlatformLink[]) ?? []);
      const rMap = linksToMap((reservationRes.data as PlatformLink[]) ?? []);
      setDeliveryLinks(mapToLinkRows(dMap, DELIVERY_PLATFORMS));
      setReservationLinks(mapToLinkRows(rMap, RESERVATION_PLATFORMS));
      setLoading(false);
    });
  }, [id]);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    setSaved(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !form) return;

    const formError = validateRestaurantForm(form);
    if (formError) {
      setError(formError);
      return;
    }

    const deliveryError = validatePlatformLinks(deliveryLinks);
    if (deliveryError) {
      setError(deliveryError);
      return;
    }

    const reservationError = validatePlatformLinks(reservationLinks);
    if (reservationError) {
      setError(reservationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateErr } = await supabase
      .from('restaurants')
      .update(toPayload(form))
      .eq('id', id);

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    try {
      await savePlatformLinks(id, 'delivery_links', deliveryLinks);
      await savePlatformLinks(id, 'reservation_links', reservationLinks);
      setSaved(true);
    } catch (linkErr) {
      setError(linkErr instanceof Error ? linkErr.message : 'Links speichern fehlgeschlagen');
    }
    setSaving(false);
  };

  if (loading) {
    return <p className="muted">Lade Restaurant…</p>;
  }

  if (!form) {
    return (
      <div>
        <p className="error">{error ?? 'Restaurant nicht gefunden.'}</p>
        <Link to="/restaurants">← Zurück zur Liste</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/restaurants" className="back-link">
            ← Restaurants
          </Link>
          <h2>{form.name}</h2>
          <p className="muted">ID: {id}</p>
        </div>
        <div className="page-actions">
          <button type="submit" form="restaurant-edit" className="primary" disabled={saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {saved ? <p className="success">Gespeichert.</p> : null}

      <form id="restaurant-edit" onSubmit={handleSubmit} className="edit-form">
        <fieldset className="form-section">
          <legend>Basis</legend>
          <div className="form-grid">
            <label>
              Name *
              <input required value={form.name} onChange={(e) => update({ name: e.target.value })} />
            </label>
            <label>
              Slug
              <input value={form.slug} onChange={(e) => update({ slug: e.target.value })} />
            </label>
            <label>
              Stadt *
              <input required value={form.city} onChange={(e) => update({ city: e.target.value })} />
            </label>
            <label>
              Region-Code *
              <input
                required
                value={form.region_code}
                onChange={(e) => update({ region_code: e.target.value })}
              />
            </label>
            <label>
              Region-Name *
              <input
                required
                value={form.region_name}
                onChange={(e) => update({ region_name: e.target.value })}
              />
            </label>
            <label>
              Provinz
              <input value={form.province} onChange={(e) => update({ province: e.target.value })} />
            </label>
            <label>
              Land
              <input
                value={form.country_code}
                onChange={(e) => update({ country_code: e.target.value })}
              />
            </label>
            <label>
              Art (venue_type)
              <input
                value={form.venue_type}
                onChange={(e) => update({ venue_type: e.target.value })}
                placeholder="restaurant, bakery, …"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Adresse & Karte</legend>
          <div className="form-grid">
            <label className="span-2">
              Straße
              <input
                value={form.address_street}
                onChange={(e) => update({ address_street: e.target.value })}
              />
            </label>
            <label>
              PLZ
              <input
                value={form.postal_code}
                onChange={(e) => update({ postal_code: e.target.value })}
              />
            </label>
            <label>
              Stadtteil
              <input value={form.district} onChange={(e) => update({ district: e.target.value })} />
            </label>
            <label>
              Breitengrad
              <input
                value={form.latitude}
                onChange={(e) => update({ latitude: e.target.value })}
              />
            </label>
            <label>
              Längengrad
              <input
                value={form.longitude}
                onChange={(e) => update({ longitude: e.target.value })}
              />
            </label>
            <label className="span-2">
              Google Maps (Profil-URL)
              <input
                type="url"
                value={form.google_maps_url}
                onChange={(e) => update({ google_maps_url: e.target.value })}
                placeholder="https://www.google.com/maps/place/…"
              />
            </label>
            <label className="span-2">
              Apple Maps (Profil-URL)
              <input
                type="url"
                value={form.apple_maps_url}
                onChange={(e) => update({ apple_maps_url: e.target.value })}
                placeholder="https://maps.apple.com/…"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Status & Veröffentlichung</legend>
          <div className="form-grid">
            <label>
              Verifizierung
              <select
                value={form.verification_status}
                onChange={(e) => update({ verification_status: e.target.value })}
              >
                {VERIFICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Zuletzt verifiziert
              <input
                type="date"
                value={form.last_verified_at}
                onChange={(e) => update({ last_verified_at: e.target.value })}
              />
            </label>
            <label>
              Preisklasse
              <input
                value={form.price_range}
                onChange={(e) => update({ price_range: e.target.value })}
                placeholder="€, €€, …"
              />
            </label>
            <label className="span-2">
              Verifizierungsmethoden (kommagetrennt)
              <input
                value={form.verification_methods}
                onChange={(e) => update({ verification_methods: e.target.value })}
              />
            </label>
            <label className="span-2">
              Küchen (kommagetrennt)
              <input
                value={form.cuisine_types}
                onChange={(e) => update({ cuisine_types: e.target.value })}
              />
            </label>
            <label className="span-2">
              Mahlzeiten (kommagetrennt)
              <input
                value={form.meal_types}
                onChange={(e) => update({ meal_types: e.target.value })}
              />
            </label>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => update({ is_published: e.target.checked })}
              />
              Veröffentlicht
            </label>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={form.is_hidden}
                onChange={(e) => update({ is_hidden: e.target.checked })}
              />
              Ausgeblendet
            </label>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={form.is_premium_partner}
                onChange={(e) => update({ is_premium_partner: e.target.checked })}
              />
              Premiumpartner
            </label>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={form.face_program}
                onChange={(e) => update({ face_program: e.target.checked })}
              />
              FACE-Programm
            </label>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={form.aoecs_certified}
                onChange={(e) => update({ aoecs_certified: e.target.checked })}
              />
              AOECS-zertifiziert
            </label>
            <label className="span-2">
              Nationale Autorität
              <input
                value={form.national_authority}
                onChange={(e) => update({ national_authority: e.target.value })}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Kontakt & Web</legend>
          <div className="form-grid">
            <label>
              Telefon
              <input value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
            </label>
            <label>
              WhatsApp
              <input value={form.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} />
            </label>
            <label>
              E-Mail
              <input
                type="email"
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </label>
            <label>
              Website
              <input value={form.website} onChange={(e) => update({ website: e.target.value })} />
            </label>
            <label>
              Speisekarte (URL)
              <input
                type="url"
                value={form.menu_url}
                onChange={(e) => update({ menu_url: e.target.value })}
                placeholder="https://…/speisekarte.pdf"
              />
              {form.menu_url.trim() ? (
                <a
                  href={form.menu_url.trim().match(/^https?:\/\//i) ? form.menu_url.trim() : `https://${form.menu_url.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Speisekarte öffnen
                </a>
              ) : null}
            </label>
            <label>
              Instagram
              <input
                value={form.instagram}
                onChange={(e) => update({ instagram: e.target.value })}
              />
            </label>
            <label>
              Facebook
              <input value={form.facebook} onChange={(e) => update({ facebook: e.target.value })} />
            </label>
            <label className="span-2">
              Öffnungszeiten
              <textarea
                rows={2}
                value={form.opening_hours}
                onChange={(e) => update({ opening_hours: e.target.value })}
              />
            </label>
            <label className="span-2">
              Saisonale Schließung
              <input
                value={form.seasonal_closure}
                onChange={(e) => update({ seasonal_closure: e.target.value })}
              />
            </label>
          </div>
        </fieldset>

        <LinkFields title="Lieferung" links={deliveryLinks} onChange={setDeliveryLinks} />
        <LinkFields title="Reservierung" links={reservationLinks} onChange={setReservationLinks} />

        <fieldset className="form-section">
          <legend>Beschreibungen</legend>
          <label>
            Deutsch
            <textarea
              rows={3}
              value={form.description_de}
              onChange={(e) => update({ description_de: e.target.value })}
            />
          </label>
          <label>
            Englisch
            <textarea
              rows={3}
              value={form.description_en}
              onChange={(e) => update({ description_en: e.target.value })}
            />
          </label>
          <label>
            Spanisch
            <textarea
              rows={3}
              value={form.description_es}
              onChange={(e) => update({ description_es: e.target.value })}
            />
          </label>
          <label>
            Bild-URL
            <input
              value={form.featured_image_url}
              onChange={(e) => update({ featured_image_url: e.target.value })}
            />
          </label>
        </fieldset>

        <div className="form-footer">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Speichern…' : 'Änderungen speichern'}
          </button>
          <button type="button" onClick={() => navigate('/restaurants')}>
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
