import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedingApi, foodApi, mealPlanApi, babyApi } from '../services/api';
import { FeedingRecord, FoodIntroduction, MealPlan, Baby } from '../types';
import Layout from '../components/layout/Layout';
import FeedingLog from '../components/nutrition/FeedingLog';
import FeedingForm from '../components/nutrition/FeedingForm';
import FoodIntroductionForm from '../components/nutrition/FoodIntroductionForm';
import MealPlanner from '../components/nutrition/MealPlanner';
import { 
  ChevronLeft, 
  Plus, 
  CheckCircle, 
  Search, 
  Award,
  Edit,
  Trash2,
  Sparkles
} from 'lucide-react';

type Tab = 'feeding' | 'foods' | 'meals';

const NutritionPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('feeding');
  const [baby, setBaby] = useState<Baby | undefined>();

  // Feeding state
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [editingFeeding, setEditingFeeding] = useState<FeedingRecord | undefined>();
  const [showFeedingForm, setShowFeedingForm] = useState(false);

  // Food introduction state
  const [foodRecords, setFoodRecords] = useState<FoodIntroduction[]>([]);
  const [editingFood, setEditingFood] = useState<FoodIntroduction | undefined>();
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<string>('all');

  // Meal plan state
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | undefined>();
  const [showMealForm, setShowMealForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Daily Meal logs checklists
  const [todayChecked, setTodayChecked] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!babyId) return;
    loadAllData();
  }, [babyId]);

  async function loadAllData() {
    try {
      setLoading(true);
      setError('');

      // Load Baby profile info
      const babyRes = await babyApi.getById(Number(babyId));
      setBaby(babyRes.data.baby);

      // Load all lists
      const [feedRes, foodRes, planRes] = await Promise.all([
        feedingApi.getAll(Number(babyId)),
        foodApi.getAll(Number(babyId)),
        mealPlanApi.getAll(Number(babyId)),
      ]);

      setFeedingRecords(feedRes.data.records || []);
      setFoodRecords(foodRes.data.records || []);
      setMealPlans(planRes.data.records || []);

      // Load checklist status
      const todayStr = new Date().toISOString().split('T')[0];
      const items = ['breakfast', 'lunch', 'snack', 'dinner'];
      const loaded: { [key: string]: boolean } = {};
      items.forEach(item => {
        const key = `${todayStr}-${babyId}-${item}`;
        loaded[key] = localStorage.getItem(key) === 'true';
      });
      setTodayChecked(loaded);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load nutrition data.');
    } finally {
      setLoading(false);
    }
  }

  // Calculate age string dynamically
  function calculateAge(birthDateString: string) {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalMonths = years * 12 + months;
    return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
  }

  // Toggle meal checklist item
  const toggleMealCheck = (item: string) => {
    if (!babyId) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = `${todayStr}-${babyId}-${item}`;
    const newVal = !todayChecked[key];
    setTodayChecked(prev => ({ ...prev, [key]: newVal }));
    localStorage.setItem(key, newVal ? 'true' : 'false');
  };

  // Feeding handlers
  async function saveFeeding(data: Partial<FeedingRecord>) {
    try {
      setError('');
      if (editingFeeding) {
        const response = await feedingApi.update(Number(babyId), editingFeeding.id, data);
        setFeedingRecords((current) =>
          current.map((r) => (r.id === editingFeeding.id ? response.data.record : r))
        );
        setEditingFeeding(undefined);
      } else {
        const response = await feedingApi.create(Number(babyId), data);
        setFeedingRecords((current) => [response.data.record, ...current]);
      }
      setShowFeedingForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save feeding record.');
      throw err;
    }
  }

  async function deleteFeeding(id: number) {
    try {
      setError('');
      await feedingApi.delete(Number(babyId), id);
      setFeedingRecords((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete feeding record.');
    }
  }

  // Food introduction handlers
  async function saveFood(data: Partial<FoodIntroduction>) {
    try {
      setError('');
      if (editingFood) {
        const response = await foodApi.update(Number(babyId), editingFood.id, data);
        setFoodRecords((current) =>
          current.map((r) => (r.id === editingFood.id ? response.data.record : r))
        );
        setEditingFood(undefined);
      } else {
        const response = await foodApi.create(Number(babyId), data);
        setFoodRecords((current) => [response.data.record, ...current]);
      }
      setShowFoodForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save food introduction.');
      throw err;
    }
  }

  async function deleteFood(id: number) {
    try {
      setError('');
      await foodApi.delete(Number(babyId), id);
      setFoodRecords((current) => current.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete food introduction.');
    }
  }

  // Meal plan handlers
  async function saveMealPlan(data: Partial<MealPlan>) {
    try {
      setError('');
      if (editingMealPlan) {
        const response = await mealPlanApi.update(Number(babyId), editingMealPlan.id, data);
        setMealPlans((current) =>
          current.map((p) => (p.id === editingMealPlan.id ? response.data.record : p))
        );
        setEditingMealPlan(undefined);
      } else {
        const response = await mealPlanApi.create(Number(babyId), data);
        setMealPlans((current) => [response.data.record, ...current]);
      }
      setShowMealForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save meal plan.');
      throw err;
    }
  }

  async function deleteMealPlan(id: number) {
    try {
      setError('');
      await mealPlanApi.delete(Number(babyId), id);
      setMealPlans((current) => current.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete meal plan.');
    }
  }

  // Filtered solid foods introduced
  const filteredFoods = useMemo(() => {
    return foodRecords.filter(food => {
      const matchesSearch = food.food_name.toLowerCase().includes(foodSearch.toLowerCase()) ||
                            (food.notes || '').toLowerCase().includes(foodSearch.toLowerCase());
      
      const categoryValue = food.reaction || 'introduced'; // reaction or generic
      const matchesCategory = selectedFoodCategory === 'all' || 
                               categoryValue.toLowerCase() === selectedFoodCategory.toLowerCase();
                               
      return matchesSearch && matchesCategory;
    });
  }, [foodRecords, foodSearch, selectedFoodCategory]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-4 py-8">
          <div className="h-8 bg-slate-100 animate-pulse rounded w-1/4"></div>
          <div className="h-12 bg-slate-100 animate-pulse rounded-full max-w-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
            <div className="h-64 bg-slate-100 animate-pulse rounded-3xl"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner Section with Floating Shapes & Cloud Transition */}
      <section className="kido-page-hero">
        <div className="kido-floating-shapes">
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
          <div className="kido-shape"></div>
        </div>

        {/* Floating Twinkles & Delight Accents */}
        <div className="kido-hero-twinkle kido-hero-twinkle-1">✨</div>
        <div className="kido-hero-twinkle kido-hero-twinkle-2">🥑</div>
        <div className="kido-hero-twinkle kido-hero-twinkle-3">✨</div>

        <div className="kido-page-hero-inner">
          <div className="kido-page-hero-content">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold transition-all cursor-pointer border border-white/30 shadow-sm"
              >
                <ChevronLeft size={14} />
                <span>Dashboard</span>
              </button>
              <span className="kido-hero-badge">
                <Sparkles size={13} className="text-amber-300" />
                <span>Pediatric Nutrition & Feeds</span>
              </span>
            </div>

            <h1 className="kido-page-hero-title">
              Nutrition & Complementary Feeding
            </h1>

            <p className="kido-page-hero-desc">
              {baby 
                ? `Track ${baby.name}'s daily milk feedings, solid food introductions, allergen responses, and weekly meal schedule.`
                : "Manage infant feeding schedules, solid foods introduction, and weekly nutritional balance."}
            </p>

            {/* Micro Stats Chips Row */}
            <div className="kido-page-hero-chips">
              {baby && (
                <>
                  <span className="kido-hero-chip">
                    👶 {baby.name}
                  </span>
                  <span className="kido-hero-chip">
                    🎂 {calculateAge(baby.date_of_birth)}
                  </span>
                </>
              )}
              <span className="kido-hero-chip">
                🍼 {feedingRecords.length} Feed Logs
              </span>
              <span className="kido-hero-chip">
                🥑 {foodRecords.length} Foods Tracked
              </span>
              {activeTab === 'feeding' && (
                <button
                  onClick={() => {
                    setEditingFeeding(undefined);
                    setShowFeedingForm(!showFeedingForm);
                  }}
                  className="kido-hero-chip accent cursor-pointer hover-scale border-none"
                >
                  <Plus size={14} />
                  <span>{showFeedingForm ? 'Close Form' : 'Log Feeding'}</span>
                </button>
              )}
              {activeTab === 'foods' && (
                <button
                  onClick={() => {
                    setEditingFood(undefined);
                    setShowFoodForm(!showFoodForm);
                  }}
                  className="kido-hero-chip accent cursor-pointer hover-scale border-none"
                >
                  <Plus size={14} />
                  <span>{showFoodForm ? 'Close Form' : 'Introduce Food'}</span>
                </button>
              )}
              {activeTab === 'meals' && (
                <button
                  onClick={() => {
                    setEditingMealPlan(undefined);
                    setShowMealForm(!showMealForm);
                  }}
                  className="kido-hero-chip accent cursor-pointer hover-scale border-none"
                >
                  <Plus size={14} />
                  <span>{showMealForm ? 'Close Form' : 'Plan Meal'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Wobbly Frame Hero Visual */}
          <div className="kido-page-hero-media wobbly-frame">
            <img src="/baby-nutrition-meals.jpg" alt="Baby healthy nutrition tracking" />
          </div>
        </div>

        {/* Cloud Transition Divider at Bottom */}
        <div className="kido-cloud-container">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,229.3C96,235,192,245,288,234.7C384,224,480,192,576,192C672,192,768,224,864,229.3C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {error && <div className="error-banner mb-6">{error}</div>}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200/80 mb-8 gap-6">
        {[
          { key: 'feeding', label: '🍼 Feeding Logs' },
          { key: 'foods', label: '🥗 Food Introduction' },
          { key: 'meals', label: '🍲 Weekly Meal Planner' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as Tab)}
            className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent border-none ${activeTab === tab.key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Feeding Tab */}
      {activeTab === 'feeding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Today's meals checklist section */}
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Today's Meals</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'breakfast', label: '🌅 Breakfast', time: '08:00 AM' },
                  { key: 'lunch', label: '☀️ Lunch', time: '12:30 PM' },
                  { key: 'snack', label: '🍎 Afternoon Snack', time: '04:00 PM' },
                  { key: 'dinner', label: '🌙 Dinner', time: '07:30 PM' }
                ].map(meal => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isChecked = !!todayChecked[`${todayStr}-${babyId}-${meal.key}`];
                  return (
                    <button
                      key={meal.key}
                      onClick={() => toggleMealCheck(meal.key)}
                      className={`flex flex-col p-4 border rounded-2xl text-left cursor-pointer transition-all ${isChecked ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-800'}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-sm">{meal.label}</span>
                        <CheckCircle size={16} className={isChecked ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-300'} />
                      </div>
                      <span className="text-xs text-slate-400 mt-2 font-medium">{meal.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feeding details form overlay */}
            {showFeedingForm && (
              <div className="kido-glass-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">{editingFeeding ? 'Edit Feeding Log Entry' : 'Log Feeding Entry'}</h3>
                <FeedingForm
                  record={editingFeeding}
                  onSubmit={saveFeeding}
                  onCancel={() => setShowFeedingForm(false)}
                />
              </div>
            )}

            {/* Feeding records table log listing */}
            <div className="kido-glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Feeding Log</h3>
              <FeedingLog
                records={feedingRecords}
                onEdit={(r) => {
                  setEditingFeeding(r);
                  setShowFeedingForm(true);
                }}
                onDelete={deleteFeeding}
              />
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Feeding Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Pediatric recommendations suggest offering breast milk or formula as the primary source of nutrition for babies up to 12 months.
            </p>
            <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs font-semibold text-sky-900 flex gap-3">
              <span className="text-xl">🍼</span>
              <div>
                <span className="font-bold block mb-1">Consistency check</span>
                Verify the baby's feeding schedule remains uniform to encourage natural sleeping loops.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Food Introduction Tab */}
      {activeTab === 'foods' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Search and filters bar */}
            <div className="kido-glass-card p-4 flex gap-4 items-center flex-wrap">
              <div className="relative flex-grow max-w-md">
                <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search foods (e.g. Avocado, Carrot)..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full font-medium text-sm w-full mt-0 focus:bg-white"
                />
              </div>

              {/* Categorical select filter */}
              <div className="flex border border-slate-200/80 rounded-full p-1 bg-slate-50">
                {[
                  { key: 'all', label: 'All Foods' },
                  { key: 'no_reaction', label: 'Introduced' },
                  { key: 'allergic', label: 'Allergy alert' }
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedFoodCategory(cat.key)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedFoodCategory === cat.key ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Form overlay */}
            {showFoodForm && (
              <div className="kido-glass-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">{editingFood ? 'Edit Solid Food Log' : 'Introduce New Solid Food'}</h3>
                <FoodIntroductionForm
                  record={editingFood}
                  onSubmit={saveFood}
                  onCancel={() => setShowFoodForm(false)}
                />
              </div>
            )}

            {/* Custom visual Food Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFoods.map((food, idx) => {
                const isAllergic = food.reaction?.toLowerCase() === 'allergic' || food.reaction?.toLowerCase() === 'allergy';
                return (
                  <div key={food.id} className="kido-glass-card p-5 hover-scale transition-all flex justify-between items-start">
                    <div className="flex gap-4 items-start">
                      {/* Food category avatar icon placeholder based on name */}
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm border border-amber-100">
                        {food.food_name.toLowerCase().includes('banana') ? '🍌' :
                         food.food_name.toLowerCase().includes('apple') ? '🍎' :
                         food.food_name.toLowerCase().includes('carrot') ? '🥕' :
                         food.food_name.toLowerCase().includes('potato') ? '🍠' :
                         food.food_name.toLowerCase().includes('egg') ? '🥚' :
                         food.food_name.toLowerCase().includes('rice') ? '🌾' : '🥑'}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{food.food_name}</h4>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-semibold mt-1 ${isAllergic ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isAllergic ? '⚠️ Allergy Alert' : '✅ Introduced'}
                        </span>
                        
                        <p className="text-xs text-slate-400 font-semibold mt-2">
                          📅 {new Date(food.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>

                        {food.notes && (
                          <p className="text-xs text-slate-500 italic mt-2 border-t border-slate-100 pt-1">
                            {food.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingFood(food);
                          setShowFoodForm(true);
                        }}
                        className="p-1 hover:bg-sky-100 rounded text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete introduced food log for ${food.food_name}?`)) {
                            deleteFood(food.id);
                          }
                        }}
                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredFoods.length === 0 && (
                <div className="col-span-2 text-center py-12 kido-glass-card">
                  <span className="text-4xl block mb-3">🥗</span>
                  <p className="text-sm font-semibold text-slate-600">No solid foods tracked</p>
                  <p className="text-xs text-slate-400 mt-1">Start introducing soft fruits, veggies, and grains</p>
                </div>
              )}
            </div>

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>Food Introduction Rules</h3>
            <ul className="flex flex-col gap-3 text-xs text-slate-500 font-semibold pl-4 list-disc">
              <li>Introduce only one new single-ingredient food at a time.</li>
              <li>Wait 3 to 5 days before introducing another food to monitor allergies.</li>
              <li>Always mash, puree, or chop solid foods to ensure safety.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. Meal Plans Tab */}
      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Meal Form overlay */}
            {showMealForm && (
              <div className="kido-glass-card p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">{editingMealPlan ? 'Edit Weekly Meal Plan' : 'Create Weekly Meal Plan'}</h3>
                <MealPlanner
                  mealPlan={editingMealPlan}
                  onSubmit={saveMealPlan}
                  onCancel={() => setShowMealForm(false)}
                />
              </div>
            )}

            {/* Meal plans list */}
            {mealPlans.length === 0 ? (
              <div className="text-center py-16 kido-glass-card shadow-sm">
                <div className="text-4xl mb-4">🍲</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No weekly meal plans set</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6 text-xs leading-relaxed">
                  Design structured weekly meal charts to monitor balanced nutrition ratios.
                </p>
                <button
                  onClick={() => setShowMealForm(true)}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all text-sm cursor-pointer shadow-lg shadow-sky-500/25"
                >
                  Create First Meal Plan
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mealPlans.map((plan) => (
                  <div key={plan.id} className="kido-glass-card p-6 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-amber-500" />
                        <h4 className="font-bold text-slate-800 text-base">Week of {plan.week_start_date}</h4>
                      </div>
                      
                      {plan.notes && (
                        <div className="text-sm text-slate-600 mt-2 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl whitespace-pre-line leading-relaxed">
                          {plan.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => {
                          setEditingMealPlan(plan);
                          setShowMealForm(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this weekly meal plan?')) {
                            deleteMealPlan(plan.id);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded text-slate-450 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="kido-glass-card p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Weekly Nutrition</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
              Planning meals ahead ensures your baby gets a variety of grains, fruits, vegetables, and protein-rich items throughout the week.
            </p>
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 text-xs font-semibold text-amber-900 flex gap-3">
              <span className="text-xl">🍲</span>
              <div>
                <span className="font-bold block mb-1">Pre-planning helper</span>
                Log ingredients you plan to offer this week to avoid duplicate groceries.
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NutritionPage;
