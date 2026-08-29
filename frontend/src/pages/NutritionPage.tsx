import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedingApi, foodApi, mealPlanApi } from '../services/api';
import { FeedingRecord, FoodIntroduction, MealPlan } from '../types';
import Layout from '../components/layout/Layout';
import FeedingLog from '../components/nutrition/FeedingLog';
import FeedingForm from '../components/nutrition/FeedingForm';
import FoodIntroductionLog from '../components/nutrition/FoodIntroductionLog';
import FoodIntroductionForm from '../components/nutrition/FoodIntroductionForm';
import MealPlanner from '../components/nutrition/MealPlanner';

type Tab = 'feeding' | 'foods' | 'meals';

const NutritionPage: React.FC = () => {
  const { babyId } = useParams<{ babyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('feeding');

  // Feeding state
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [editingFeeding, setEditingFeeding] = useState<FeedingRecord | undefined>();

  // Food introduction state
  const [foodRecords, setFoodRecords] = useState<FoodIntroduction[]>([]);
  const [editingFood, setEditingFood] = useState<FoodIntroduction | undefined>();

  // Meal plan state
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlan | undefined>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!babyId) return;
    loadAllData();
  }, [babyId]);

  async function loadAllData() {
    try {
      setLoading(true);
      const [feedRes, foodRes, planRes] = await Promise.all([
        feedingApi.getAll(Number(babyId)),
        foodApi.getAll(Number(babyId)),
        mealPlanApi.getAll(Number(babyId)),
      ]);

      setFeedingRecords(feedRes.data.records || []);
      setFoodRecords(foodRes.data.records || []);
      setMealPlans(planRes.data.records || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load nutrition data.');
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return (
      <Layout>
        <p className="subtext">Loading nutrition data…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="nutrition-page">
        <div className="back-link">
          <button onClick={() => navigate(`/baby/${babyId}`)}>← Back to baby profile</button>
        </div>
        <h1>Nutrition & Feeding</h1>
        {error && <p className="error" role="alert">{error}</p>}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'feeding' ? 'active' : ''}`}
            onClick={() => setActiveTab('feeding')}
          >
            Feeding Log
          </button>
          <button
            className={`tab-button ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            Food Introduction
          </button>
          <button
            className={`tab-button ${activeTab === 'meals' ? 'active' : ''}`}
            onClick={() => setActiveTab('meals')}
          >
            Meal Plans
          </button>
        </div>

        {activeTab === 'feeding' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-nutrition.jpg" alt="Baby feeding" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Feeding Records</h2>
              <FeedingLog
                records={feedingRecords}
                onEdit={setEditingFeeding}
                onDelete={deleteFeeding}
              />
            </div>
            <section className="form-panel">
              <h2>{editingFeeding ? 'Edit Feeding' : 'Log Feeding'}</h2>
              <FeedingForm
                record={editingFeeding}
                onSubmit={saveFeeding}
                onCancel={() => setEditingFeeding(undefined)}
              />
            </section>
          </section>
        )}

        {activeTab === 'foods' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame-alt" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-nutrition-meals.jpg" alt="Healthy baby foods" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Foods Introduced</h2>
              <FoodIntroductionLog
                records={foodRecords}
                onEdit={setEditingFood}
                onDelete={deleteFood}
              />
            </div>
            <section className="form-panel">
              <h2>{editingFood ? 'Edit Food' : 'New Food'}</h2>
              <FoodIntroductionForm
                record={editingFood}
                onSubmit={saveFood}
                onCancel={() => setEditingFood(undefined)}
              />
            </section>
          </section>
        )}

        {activeTab === 'meals' && (
          <section className="two-column-layout">
            <div>
              <div className="page-illustration wobbly-frame" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                <img src="/baby-nutrition-meals.jpg" alt="Meal planning guide" style={{ width: '100%', borderRadius: 'inherit' }} />
              </div>
              <h2>Meal Plans</h2>
              {mealPlans.length === 0 ? (
                <p className="empty-state">No meal plans yet.</p>
              ) : (
                <div className="meal-plans-list">
                  {mealPlans.map((plan) => (
                    <article key={plan.id} className="record-item">
                      <div>
                        <h3>Week of {plan.week_start_date}</h3>
                        {plan.notes && <p>{plan.notes}</p>}
                      </div>
                      <div className="record-actions">
                        <button
                          className="edit-button"
                          onClick={() => setEditingMealPlan(plan)}
                        >
                          Edit
                        </button>
                        <button
                          className="remove-button"
                          onClick={() => {
                            if (window.confirm('Delete this meal plan?')) {
                              deleteMealPlan(plan.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <section className="form-panel">
              <h2>{editingMealPlan ? 'Edit Meal Plan' : 'Create Meal Plan'}</h2>
              <MealPlanner
                mealPlan={editingMealPlan}
                onSubmit={saveMealPlan}
                onCancel={() => setEditingMealPlan(undefined)}
              />
            </section>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default NutritionPage;
