import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children }) {
  return (
    <section className="bg-white/70 backdrop-blur rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Chip({ children }) {
  return <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs mr-2 mb-2">{children}</span>
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Wellness & Food Companion</h1>
          <p className="text-gray-600">Find places to eat, generate meal plans, and manage your pantry — all in one place.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <RestaurantFinder />
          <NutritionFitnessGenerator />
          <CustomMealBuilder />
          <MealPlanControls />
          <SmartPantry />
          <ProductScanner />
        </div>
      </div>
    </div>
  )
}

function RestaurantFinder() {
  const [form, setForm] = useState({ location: '', cuisine_or_dish: '', budget: 'medium' })
  const [results, setResults] = useState([])
  const budgets = [
    { key: 'cheap', label: 'Cheap' },
    { key: 'medium', label: 'Medium' },
    { key: 'expensive', label: 'Expensive' },
  ]

  async function search() {
    const res = await fetch(`${API}/api/restaurants/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setResults(data)
  }

  return (
    <Section title="Find Restaurants">
      <div className="grid sm:grid-cols-4 gap-2">
        <input value={form.location} onChange={e=>setForm({ ...form, location: e.target.value })} placeholder="Location or use GPS" className="col-span-2 input" />
        <input value={form.cuisine_or_dish} onChange={e=>setForm({ ...form, cuisine_or_dish: e.target.value })} placeholder="Cuisine or dish" className="input" />
        <select value={form.budget} onChange={e=>setForm({ ...form, budget: e.target.value })} className="input">
          {budgets.map(b=> <option key={b.key} value={b.key}>{b.label}</option>)}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={search} className="btn-primary">Search</button>
        <button onClick={()=>{
          navigator.geolocation?.getCurrentPosition(pos => {
            setForm(f => ({ ...f, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }))
          })
        }} className="btn">Use GPS</button>
      </div>
      <div className="mt-4 space-y-3">
        {results.map((r, i) => (
          <div key={i} className="p-3 rounded-lg border bg-white flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{r.name} • <span className="text-gray-600">{r.cuisine}</span></div>
              <div className="text-sm text-gray-600">{r.address} • {r.distance_km} km • {r.price_range}
              </div>
              <div className="mt-1">{r.dietary_tags?.map((t, idx) => <Chip key={idx}>{t}</Chip>)}</div>
            </div>
            <div className="text-emerald-600 font-semibold">⭐ {r.rating}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function NutritionFitnessGenerator() {
  const [form, setForm] = useState({ age: '', weight: '', height: '', gender: 'female', goal: 'lose weight', workout_preference: 'Home', diet_type: 'omnivore', allergies: '', dislikes: '' })
  const [plan, setPlan] = useState(null)

  async function generate() {
    const payload = {
      ...form,
      age: form.age ? Number(form.age) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      height: form.height ? Number(form.height) : undefined,
      allergies: form.allergies ? form.allergies.split(',').map(s=>s.trim()).filter(Boolean) : [],
      dislikes: form.dislikes ? form.dislikes.split(',').map(s=>s.trim()).filter(Boolean) : [],
    }
    const res = await fetch(`${API}/api/nutrition/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    setPlan(data)
  }

  async function viewGroceries() {
    const res = await fetch(`${API}/api/nutrition/groceries`)
    const data = await res.json()
    alert(Array.isArray(data) ? data.join('\n') : 'No groceries saved yet')
  }

  return (
    <Section title="Nutrition & Fitness Generator">
      <div className="grid sm:grid-cols-2 gap-2">
        <input className="input" placeholder="Age" value={form.age} onChange={e=>setForm({ ...form, age: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="Weight (kg)" value={form.weight} onChange={e=>setForm({ ...form, weight: e.target.value })} />
          <input className="input" placeholder="Height (cm)" value={form.height} onChange={e=>setForm({ ...form, height: e.target.value })} />
        </div>
        <select className="input" value={form.gender} onChange={e=>setForm({ ...form, gender: e.target.value })}>
          <option>female</option>
          <option>male</option>
          <option>other</option>
        </select>
        <select className="input" value={form.goal} onChange={e=>setForm({ ...form, goal: e.target.value })}>
          {['lose weight','get lean','build muscle','bulk','maintain weight'].map(g=> <option key={g}>{g}</option>)}
        </select>
        <select className="input" value={form.workout_preference} onChange={e=>setForm({ ...form, workout_preference: e.target.value })}>
          {['Home','Gym','Outdoor'].map(o=> <option key={o}>{o}</option>)}
        </select>
        <select className="input" value={form.diet_type} onChange={e=>setForm({ ...form, diet_type: e.target.value })}>
          {['omnivore','vegan','vegetarian','gluten-free','lactose-intolerant'].map(o=> <option key={o}>{o}</option>)}
        </select>
        <input className="input col-span-2" placeholder="Allergies (comma separated)" value={form.allergies} onChange={e=>setForm({ ...form, allergies: e.target.value })} />
        <input className="input col-span-2" placeholder="Dislikes (comma separated)" value={form.dislikes} onChange={e=>setForm({ ...form, dislikes: e.target.value })} />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn-primary" onClick={generate}>Generate</button>
        <button className="btn" onClick={viewGroceries}>View Groceries</button>
      </div>

      {plan && (
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-lg border bg-white">
            <div className="font-semibold">Daily calories: {plan.daily_calorie_target}</div>
          </div>
          <div className="p-3 rounded-lg border bg-white">
            <div className="font-semibold mb-2">Meals</div>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {plan.meal_plan?.meals?.map((m,i)=> (
                <li key={i} className="mb-1">
                  <span className="font-medium">{m.title}</span> — {m.calories} kcal • P{m.protein_g}/C{m.carbs_g}/F{m.fats_g}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 rounded-lg border bg-white">
            <div className="font-semibold mb-2">Program ({plan.fitness_program?.setting})</div>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {plan.fitness_program?.days?.map((d,i)=> (
                <li key={i} className="mb-1">
                  <span className="font-medium">{d.day}:</span> {d.workout.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Section>
  )
}

function CustomMealBuilder() {
  const [form, setForm] = useState({ dish: '', portions: 1, diet_type: 'omnivore' })
  const [resData, setResData] = useState(null)

  async function build() {
    const res = await fetch(`${API}/api/custom-meal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, portions: Number(form.portions) }) })
    const data = await res.json()
    setResData(data)
  }

  return (
    <Section title="Custom Meal Planner">
      <div className="grid grid-cols-3 gap-2">
        <input className="input col-span-2" placeholder="Desired dish" value={form.dish} onChange={e=>setForm({ ...form, dish: e.target.value })} />
        <input className="input" type="number" min="1" value={form.portions} onChange={e=>setForm({ ...form, portions: e.target.value })} />
        <select className="input" value={form.diet_type} onChange={e=>setForm({ ...form, diet_type: e.target.value })}>
          {['omnivore','vegan','vegetarian','gluten-free','lactose-intolerant'].map(o=> <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="mt-3">
        <button className="btn-primary" onClick={build}>Build Meal</button>
      </div>

      {resData && (
        <div className="mt-4 p-3 rounded-lg border bg-white">
          <div className="font-semibold">Ingredients</div>
          <ul className="list-disc pl-5 text-sm text-gray-700 mb-2">
            {resData.ingredients.map((ing, i)=> <li key={i}>{ing}</li>)}
          </ul>
          <div className="font-semibold">Nutrition</div>
          <div className="text-sm text-gray-700">Calories: {resData.nutrition.calories} • P{resData.nutrition.protein_g} / C{resData.nutrition.carbs_g} / F{resData.nutrition.fats_g}</div>
        </div>
      )}
    </Section>
  )
}

function MealPlanControls() {
  const [prefs, setPrefs] = useState({ allergies: '', dislikes: '', diet_type: 'omnivore' })

  async function savePrefs() {
    await fetch(`${API}/api/preferences/update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      allergies: prefs.allergies ? prefs.allergies.split(',').map(s=>s.trim()).filter(Boolean) : [],
      dislikes: prefs.dislikes ? prefs.dislikes.split(',').map(s=>s.trim()).filter(Boolean) : [],
      diet_type: prefs.diet_type
    })})
    alert('Preferences saved')
  }

  return (
    <Section title="Meal Plan Settings">
      <div className="grid grid-cols-3 gap-2">
        <input className="input col-span-2" placeholder="Allergies (comma separated)" value={prefs.allergies} onChange={e=>setPrefs({ ...prefs, allergies: e.target.value })} />
        <input className="input col-span-2" placeholder="Dislikes (comma separated)" value={prefs.dislikes} onChange={e=>setPrefs({ ...prefs, dislikes: e.target.value })} />
        <select className="input" value={prefs.diet_type} onChange={e=>setPrefs({ ...prefs, diet_type: e.target.value })}>
          {['omnivore','vegan','vegetarian','gluten-free','lactose-intolerant'].map(o=> <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <RegenerateButton />
        <button className="btn" onClick={savePrefs}>Allergy & Preference Filter</button>
      </div>
    </Section>
  )
}

function RegenerateButton() {
  const [loading, setLoading] = useState(false)
  async function regenerate() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/nutrition/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal: 'maintain weight', workout_preference: 'Home' })})
      await res.json()
      alert('New plan generated')
    } finally {
      setLoading(false)
    }
  }
  return <button className="btn" onClick={regenerate} disabled={loading}>{loading ? 'Regenerating...' : 'Regenerate Plan'}</button>
}

function SmartPantry() {
  const [name, setName] = useState('')
  const [items, setItems] = useState([])
  const [suggestions, setSuggestions] = useState([])

  async function addItem() {
    if (!name) return
    await fetch(`${API}/api/pantry/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    setName('')
    load()
  }
  async function load() {
    const res = await fetch(`${API}/api/pantry/list`)
    setItems(await res.json())
    const sres = await fetch(`${API}/api/pantry/suggest`)
    setSuggestions(await sres.json())
  }
  useEffect(()=>{ load() },[])

  async function scanReceipt() {
    const res = await fetch(`${API}/api/pantry/scan-receipt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_base64: '' }) })
    const data = await res.json()
    alert(`Detected: ${data.detected.join(', ')}`)
    load()
  }
  async function uploadPhoto() {
    const res = await fetch(`${API}/api/pantry/photo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_base64: '' }) })
    const data = await res.json()
    alert(`Detected: ${data.detected.join(', ')}`)
    load()
  }

  return (
    <Section title="Smart Pantry">
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="Add ingredient" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn-primary" onClick={addItem}>Add</button>
      </div>
      <div className="mt-3 text-sm text-gray-700">
        <div className="font-semibold mb-1">Pantry</div>
        <div className="flex flex-wrap gap-2">
          {items.map((it, i)=> <Chip key={i}>{it.name}{it.quantity ? ` (${it.quantity})` : ''}</Chip>)}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-700">
        <div className="font-semibold mb-1">Suggestions</div>
        <ul className="list-disc pl-5">
          {suggestions.map((s,i)=> <li key={i}>{s}</li>)}
        </ul>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn" onClick={scanReceipt}>Scan Receipt (OCR)</button>
        <button className="btn" onClick={uploadPhoto}>Pantry Photo Upload (AI)</button>
      </div>
    </Section>
  )
}

function ProductScanner() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  async function scan() {
    const res = await fetch(`${API}/api/product/scan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
    const data = await res.json()
    setResult(data)
  }

  return (
    <Section title="Smart Product Scanner">
      <div className="flex gap-2">
        <input className="input" placeholder="Barcode / QR code" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="btn-primary" onClick={scan}>Scan</button>
      </div>
      {result && (
        <div className="mt-3 p-3 rounded-lg border bg-white text-sm text-gray-700">
          <div>Calories: <span className="font-medium">{result.calories}</span></div>
          <div>Processed content: <span className="font-medium">{result.processed_percent}%</span></div>
          <div>Health rating: <span className={`font-semibold ${result.health_rating==='Good' ? 'text-emerald-600' : result.health_rating==='Moderate' ? 'text-amber-600' : 'text-rose-600'}`}>{result.health_rating}</span></div>
        </div>
      )}
    </Section>
  )
}

// basic utility classes
const base = 'border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400'
const btn = 'px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800'
const btnPrimary = 'px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white'

// Inject tailwind classes
const style = document.createElement('style')
style.innerHTML = `
.input{ ${base} }
.btn{ ${btn} }
.btn-primary{ ${btnPrimary} }
`
document.head.appendChild(style)
