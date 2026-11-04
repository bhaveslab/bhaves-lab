import { useEffect, useRef, useState, type FormEvent } from 'react';
async function post(data: unknown, token?: string) {
    const r = await fetch('/api/booking', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(data) });
    if (!r.ok) {
        const result = await r.json();
        throw new Error(result.error || 'Booking could not be verified.');
    }
    return r;
}
const attemptKey = 'bhave-booking-attempt';
export function PaidBooking({ fallback }: {
    fallback: React.ReactNode;
}) {
    const [enabled, setEnabled] = useState(false), [date, setDate] = useState(''), [slots, setSlots] = useState<number[]>([]), [timezone, setTimezone] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState<{
        start: number;
        ebookEdition: string;
        roomToken: string;
        ebookToken: string;
    } | null>(null);
    const [ebookToken, setEbookToken] = useState<string | null>(null);
    const generation = useRef(0);
    const dateInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const ebook = new URLSearchParams(window.location.hash.slice(1)).get('ebook');
        if (ebook) {
            setEbookToken(ebook);
            window.history.replaceState(null, '', window.location.pathname + '?stage=confirmed');
        }
        const abort = new AbortController();
        fetch('/api/booking', { cache: 'no-store', signal: abort.signal }).then(r => r.json()).then(result => {
            if (!result.ready)
                return;
            setEnabled(true);
            const attempt = sessionStorage.getItem(attemptKey);
            if (attempt && new URLSearchParams(window.location.search).get('stage') === 'confirmed')
                return post({ action: 'status', attempt }).then(r => r.json()).then(r => { if (r.state === 'confirmed') {
                    setConfirmed(r);
                    setEbookToken(r.ebookToken);
                }
                else
                    setMessage('Payment and reservation are being verified. Your redirect does not confirm a booking. Refresh to check again, or contact info@bhaveslab.com.'); });
        }).catch(() => { });
        return () => abort.abort();
    }, []);
    async function dates(value: string) { setDate(value); setSlots([]); setMessage('Checking availability…'); const request = ++generation.current; try {
        const r = await (await post({ action: 'availability', date: value })).json();
        if (request !== generation.current)
            return;
        setSlots(r.slots);
        setTimezone(r.timezone);
        setMessage(r.slots.length ? '' : 'No available times on this date.');
    }
    catch (e) {
        if (request === generation.current)
            setMessage((e as Error).message);
    } }
    async function checkout(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setMessage('Protecting your appointment and opening secure checkout…'); const data = Object.fromEntries(new FormData(e.currentTarget)); let attempt = sessionStorage.getItem(attemptKey); if (!attempt) {
        attempt = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem(attemptKey, attempt);
    } try {
        const r = await (await post({ action: 'checkout', attempt, start: Number(data.start), edition: data.edition, email: data.email })).json();
        const url = new URL(r.url);
        if (url.origin !== 'https://checkout.stripe.com')
            throw Error('Checkout could not be opened.');
        window.location.assign(url.href);
    }
    catch (e) {
        setMessage((e as Error).message);
        setBusy(false);
    } }
    async function download() { if (!ebookToken)
        return; setBusy(true); try {
        const r = await post({ action: 'download' }, ebookToken);
        const blob = await r.blob(), url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url;
        a.download = r.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] || 'The_Possibility.pdf';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    catch (e) {
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    if (ebookToken || confirmed)
        return <section className="booking-form" aria-label="Private session confirmation"><h2>{confirmed ? 'Your session is confirmed.' : 'Your included edition.'}</h2>{confirmed && <><p>{new Date(confirmed.start).toLocaleString()} · {confirmed.ebookEdition === 'es' ? 'Español' : 'English'}</p><p>Your email contains the appointment details and Google Meet link.</p><a className="lab-button" href={'/room-of-clarity#access=' + confirmed.roomToken}>Enter your confirmed session</a></>}<p>Downloads require a currently verified payment and reservation.</p><button className="lab-button" onClick={download} disabled={busy}>Download included ebook</button><p role="status">{message}</p></section>;
    if (!enabled)
        return <>{fallback}</>;
    return (
      <form className="booking-form" onSubmit={checkout} aria-label="Paid Possibility Session booking">
        <span className="lab-kicker">60 MINUTES · $175 · WITH BHAVÉ</span>
        <h2>Choose your time.</h2>
        <p>Your selected English or Spanish ebook is included at no additional cost. No account required.</p>
        <label>Appointment date
          <input type="date" required ref={dateInput} onChange={() => { setSlots([]); setMessage(''); }} />
        </label>
        <button className="lab-button" type="button" disabled={busy} onClick={() => {
          if (dateInput.current?.value) void dates(dateInput.current.value);
        }}>Check availability</button>
        <label>Available time {timezone && '· ' + timezone}
          <select name="start" required key={date} defaultValue="">
            <option value="" disabled>Select an available time</option>
            {slots.map(start => <option key={start} value={start}>{new Date(start).toLocaleString(undefined, { timeZone: timezone, dateStyle: 'medium', timeStyle: 'short' })}</option>)}
          </select>
        </label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>Your included ebook language
          <select name="edition" defaultValue="en">
            <option value="en">English — The Possibility</option>
            <option value="es">Español — La posibilidad</option>
          </select>
        </label>
        <p className="form-note">Your time is confirmed only after payment and reservation are verified. Returning from checkout does not confirm a booking. Retry the same selection after an interruption; contact us to change an attempt already in progress.</p>
        <button className="lab-button" disabled={busy || !slots.length}>Continue to secure checkout · $175</button>
        <p role="status" aria-live="polite">{message}</p>
      </form>
    );
}
