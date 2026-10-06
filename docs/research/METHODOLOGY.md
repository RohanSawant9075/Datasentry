# Research Methodology

## Research Question

**Primary Question:**
> How does data quality degradation affect downstream ML model predictions and the safety of automated decisions?

**Secondary Questions:**
1. Can we quantify the relationship between data quality issues and model performance degradation?
2. Can we predict decision risk based on data reliability metrics?
3. Does a quality-aware decision framework reduce unsafe automated decisions compared to baseline approaches?

---

## Research Gap

### Current State

Most data quality systems provide:
- ✅ Data profiling statistics
- ✅ Quality dimension scores (completeness, validity, etc.)
- ✅ Anomaly detection
- ✅ Drift detection

**But they stop there.**

### The Gap

Current systems do NOT:
- ❌ Link data quality issues to model performance impact
- ❌ Assess which quality issues actually matter for the model
- ❌ Quantify downstream decision risk
- ❌ Provide actionable recommendations based on impact

### DataSentry-AI's Contribution

DataSentry-AI proposes a framework that:
1. **Links** data quality → model impact → decision risk
2. **Prioritizes** quality issues by their model exposure and impact
3. **Quantifies** decision safety based on data reliability
4. **Recommends** appropriate actions (continue, warn, review, block)

**Important:** This is our PROPOSED research framework, not an established industry standard. The methodology requires experimental validation.

---

## Proposed Framework

### Conceptual Model

```
DATA QUALITY ISSUES
        ↓
    (Are these features used by the model?)
        ↓
    FEATURE IMPORTANCE × QUALITY ISSUE
        ↓
    MODEL EXPOSURE SCORE
        ↓
    (How much does model performance degrade?)
        ↓
    PREDICTION ERROR INCREASE
        ↓
    (How does this affect business decisions?)
        ↓
    DECISION IMPACT SCORE
        ↓
    RISK CLASSIFICATION
        ↓
    RECOMMENDATION
```

---

## Experimental Design

### Objective

Validate that the DataSentry framework:
1. Detects data quality degradation
2. Correctly identifies model impact
3. Accurately classifies decision risk
4. Reduces unsafe automated decisions compared to baselines

---

### Experimental Setup

#### Dataset

**Primary Case Study: Retail Sales Forecasting**

- **Domain:** Retail
- **Task:** Demand prediction for inventory decisions
- **Dataset:** Retail sales data (synthetic or real)
  - Features: date, product_id, store_id, quantity, price, promotions, weather, day_of_week
  - Target: sales/demand
  - Size: 10,000+ rows
  - Time period: 1 year

#### Corruption Framework

Create controlled dataset versions:

1. **CLEAN** - Baseline (0% corruption)
2. **10% DEGRADATION**
   - 5% missing values in random features
   - 3% outliers in numerical features
   - 2% invalid values

3. **25% DEGRADATION**
   - 12% missing values
   - 8% outliers
   - 5% invalid values

4. **50% DEGRADATION**
   - 25% missing values
   - 15% outliers
   - 10% invalid values

**Corruption Types:**
- **Missing values:** Randomly set values to NULL
- **Outliers:** Replace values with extreme outliers (>3 std deviations)
- **Invalid values:** Replace with invalid values (e.g., negative prices)
- **Duplicates:** Introduce duplicate rows
- **Distribution shift:** Modify value distributions
- **Schema drift:** Change data types

**Important:** 
- Use fixed random seeds for reproducibility
- Apply corruption to specific features with known importance
- Store corruption metadata (which rows, which columns, corruption type)

---

### Configurations Under Test

#### 1. BASELINE
**No quality checks**

```
Data → Model → Decision
```

- Load data directly
- Train model
- Make predictions
- Execute decisions
- No quality awareness

**Expected:** High decision error under data degradation.

---

#### 2. QUALITY-AWARE
**Basic quality threshold**

```
Data → Quality Check → [Pass/Fail] → Model → Decision
```

- Check overall quality score
- If quality < threshold (e.g., 70%), reject
- Otherwise, proceed normally
- Binary decision (use data or reject)

**Expected:** Reduces some errors but is overly conservative (rejects usable data).

---

#### 3. DATASENTRY
**Full framework**

```
Data → Quality → Reliability → Model Impact → Decision Impact → Action
```

- Assess data quality
- Calculate reliability score
- Evaluate model exposure
- Measure prediction impact
- Classify decision risk (LOW/MEDIUM/HIGH/CRITICAL)
- Recommend action:
  - **LOW:** Continue normally
  - **MEDIUM:** Warning, monitor
  - **HIGH:** Human review required
  - **CRITICAL:** Block automated decision, use fallback

**Expected:** Optimal balance - allows safe decisions with imperfect data, blocks truly unsafe decisions.

---

### Evaluation Metrics

#### 1. Model Performance Metrics

**Prediction Accuracy:**
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- WMAPE (Weighted Mean Absolute Percentage Error)
- R² Score

**Degradation:**
```
degradation = (corrupted_error - clean_error) / clean_error × 100%
```

---

#### 2. Decision Quality Metrics

**For Retail Domain:**

- **Stockout Rate:** Predicted too low, inventory runs out
- **Overstock Rate:** Predicted too high, excess inventory
- **Service Level:** % of demand met
- **Inventory Cost:** Holding costs + stockout costs
- **Decision Error Rate:** % of wrong decisions

**Decision is "WRONG" if:**
- Prediction error > 20% AND decision was automated
- OR Stockout occurred due to underprediction
- OR Overstock > 50% due to overprediction

---

#### 3. Framework Performance Metrics

**Detection Metrics:**
- **Sensitivity (Recall):** % of unsafe decisions correctly identified
- **Specificity:** % of safe decisions correctly identified
- **Precision:** % of flagged decisions that were actually unsafe
- **F1 Score:** Harmonic mean of precision and recall
- **False Positive Rate:** Safe decisions incorrectly flagged
- **False Negative Rate:** Unsafe decisions missed

**Safety Metrics:**
- **Unsafe Automated Decisions:** Count of high-risk decisions executed
- **Unnecessary Blocks:** Count of safe decisions blocked
- **Human Review Rate:** % of decisions requiring review

**Efficiency Metrics:**
- **Processing Time:** Time to analyze dataset
- **Latency:** Time from data ingestion to decision
- **Throughput:** Datasets processed per hour

---

### Experimental Procedure

#### Phase 1: Data Preparation

1. Obtain clean retail sales dataset
2. Split into train/test (80/20)
3. Generate corrupted versions (10%, 25%, 50%)
4. Store all versions with metadata

#### Phase 2: Model Training

1. Train baseline model on CLEAN training data
2. Evaluate on CLEAN test data (baseline performance)
3. Record metrics and feature importance

#### Phase 3: Configuration Testing

**For each corruption level (0%, 10%, 25%, 50%):**

**Run BASELINE:**
1. Load corrupted test data (no checks)
2. Generate predictions
3. Simulate inventory decisions
4. Record: prediction errors, decision errors, business metrics

**Run QUALITY-AWARE:**
1. Load corrupted test data
2. Calculate overall quality score
3. If quality < 70%, reject dataset (no decisions made)
4. Else, generate predictions and simulate decisions
5. Record: rejection rate, prediction errors, decision errors

**Run DATASENTRY:**
1. Load corrupted test data
2. Profile data
3. Assess quality (all dimensions)
4. Detect anomalies
5. Detect drift (vs training data)
6. Calculate reliability score
7. Analyze model exposure (feature importance × quality issues)
8. Measure model impact (prediction degradation)
9. Analyze decision impact
10. Classify risk (LOW/MEDIUM/HIGH/CRITICAL)
11. Recommend action
12. Execute decision based on risk:
    - LOW: Automated decision
    - MEDIUM: Automated with warning
    - HIGH: Human review (simulate: use fallback model)
    - CRITICAL: Block (no automated decision)
13. Record all metrics

#### Phase 4: Analysis

Compare configurations across corruption levels:

**Research Questions:**

**RQ1: Detection Accuracy**
- Does DataSentry correctly identify data quality issues?
- Does it accurately classify decision risk?

**RQ2: Decision Safety**
- Does DataSentry reduce unsafe automated decisions vs BASELINE?
- Does DataSentry have fewer unnecessary blocks vs QUALITY-AWARE?

**RQ3: Practical Trade-offs**
- What is the human review rate?
- What is the processing overhead?
- Is the complexity justified by the safety improvement?

---

### Statistical Analysis

**Hypothesis Testing:**

**H1:** DataSentry's decision error rate is significantly lower than BASELINE
```
H0: error_datasentry >= error_baseline
H1: error_datasentry < error_baseline
Test: One-tailed paired t-test, α = 0.05
```

**H2:** DataSentry allows more safe decisions than QUALITY-AWARE
```
H0: safe_decisions_datasentry <= safe_decisions_quality_aware
H1: safe_decisions_datasentry > safe_decisions_quality_aware
Test: One-tailed paired t-test, α = 0.05
```

**Effect Size:**
- Cohen's d for decision error reduction
- Practical significance: Error reduction > 20%

**Confidence Intervals:**
- 95% CI for all metrics
- Bootstrap resampling if needed (n=1000)

---

### Reproducibility

**All experiments must be reproducible:**

```python
# Fixed random seeds
SEED = 42
np.random.seed(SEED)
random.seed(SEED)

# Version tracking
EXPERIMENT_VERSION = "1.0.0"
MODEL_VERSION = "1.0.0"
QUALITY_ENGINE_VERSION = "1.0.0"

# Metadata storage
experiment_metadata = {
    "experiment_id": "exp_001",
    "dataset": "retail_sales_v1",
    "corruption_level": 0.25,
    "corruption_seed": 42,
    "model_version": "1.0.0",
    "configuration": "datasentry",
    "timestamp": "2026-09-14T17:00:00Z"
}

# Store with results
save_results(metrics, metadata=experiment_metadata)
```

**Git Repository:**
- All code version controlled
- Experiment scripts in `experiments/`
- Results in `experiments/results/`
- Notebooks in `experiments/notebooks/`

---

### Expected Results

#### Hypothesized Outcomes

**Under CLEAN data (0% corruption):**
- All configurations perform similarly
- DataSentry overhead is minimal

**Under 10% corruption:**
- BASELINE: Minor degradation (~10-15% error increase)
- QUALITY-AWARE: Likely passes threshold, similar to BASELINE
- DATASENTRY: Detects issues, classifies as LOW-MEDIUM risk, continues with monitoring

**Under 25% corruption:**
- BASELINE: Significant degradation (~30-50% error increase)
- QUALITY-AWARE: May reject dataset (if quality < 70%)
- DATASENTRY: Classifies as HIGH risk, triggers human review or fallback

**Under 50% corruption:**
- BASELINE: Severe degradation (>80% error increase)
- QUALITY-AWARE: Likely rejects dataset
- DATASENTRY: Classifies as CRITICAL, blocks automated decisions

**Key Hypothesis:**
DataSentry should:
- ✅ Allow safe decisions even with minor quality issues (better than QUALITY-AWARE)
- ✅ Prevent unsafe decisions with major quality issues (better than BASELINE)
- ✅ Provide interpretable explanations for risk classification

---

## Limitations

### Acknowledged Limitations

1. **Domain Specificity**
   - Validation limited to retail domain
   - Generalizability to other domains requires additional validation
   - Business metrics are domain-specific

2. **Simulated Decisions**
   - Decision outcomes are simulated, not real business data
   - Actual business impact may differ

3. **Synthetic Corruption**
   - Controlled corruption may not match real-world data quality issues
   - Real degradation may be more complex

4. **Single Model Type**
   - Evaluation on one model algorithm (LightGBM)
   - Different models may respond differently to quality issues

5. **Scoring Function**
   - The impact scoring mechanism is a proposed heuristic
   - Optimal weighting of components requires tuning

6. **Sample Size**
   - Single dataset for primary validation
   - Multiple datasets would strengthen conclusions

7. **Temporal Aspects**
   - Static evaluation, not temporal drift over time
   - Real-world drift may be gradual

---

## Research Contribution

### Novel Contributions

1. **Integrated Framework:** End-to-end connection from data quality to decision safety
2. **Model Exposure Analysis:** Linking quality issues to model features by importance
3. **Decision Impact Quantification:** Domain-specific decision risk assessment
4. **Risk-Based Recommendations:** Graduated response based on impact severity

### Academic Value

- Framework for trustworthy AI systems
- Methodology for data reliability assessment
- Empirical validation approach
- Open-source reference implementation

---

## Future Work

### Short-term Extensions

1. **Multiple Domains:** Validate on manufacturing, finance, healthcare
2. **Multiple Models:** Test with different algorithms (neural networks, etc.)
3. **Real-world Data:** Evaluate on real data quality issues
4. **Temporal Analysis:** Evaluate drift over time
5. **Adaptive Thresholds:** Learn optimal risk thresholds from historical data

### Long-term Research

1. **Causal Analysis:** Causal inference for impact attribution
2. **Automated Repair:** Data cleaning guided by impact analysis
3. **Active Learning:** Learn quality-impact relationships over time
4. **Multi-Model Ensembles:** Ensemble reliability under data degradation
5. **Federated Settings:** Data reliability in federated learning

---

## Ethical Considerations

### Responsible AI

1. **Transparency:** All decisions must be explainable
2. **Human Oversight:** Critical decisions require human review
3. **Bias Awareness:** Quality issues may correlate with protected attributes
4. **Privacy:** Data profiling must respect privacy constraints
5. **Accountability:** Clear audit trail for all decisions

### Limitations Disclosure

- Framework is a research prototype
- Not validated for safety-critical domains (healthcare, aviation, etc.)
- Requires domain expertise for proper configuration
- Not a substitute for human judgment in high-stakes decisions

---

## Validation Checklist

Before claiming research contribution:

- [ ] Controlled corruption framework implemented
- [ ] All three configurations (BASELINE, QUALITY-AWARE, DATASENTRY) tested
- [ ] Multiple corruption levels evaluated (0%, 10%, 25%, 50%)
- [ ] Statistical significance tests performed
- [ ] Results reproducible with fixed seeds
- [ ] All code and data versioned
- [ ] Experiment metadata stored
- [ ] Limitations clearly stated
- [ ] Results interpretation is honest and conservative
- [ ] No fabricated or inflated metrics

---

## Publication Strategy

### Target Venues

**Conferences:**
- ACM SIGKDD (Data Mining)
- ICML (Machine Learning)
- NeurIPS (ML Workshop)
- VLDB (Data Management)

**Journals:**
- Journal of Machine Learning Research
- Data Mining and Knowledge Discovery
- IEEE Transactions on Knowledge and Data Engineering

### Paper Structure

1. **Abstract**
2. **Introduction:** Problem, gap, contribution
3. **Related Work:** Data quality, ML robustness, decision systems
4. **Proposed Framework:** DataSentry architecture
5. **Experimental Design:** Setup, configurations, metrics
6. **Results:** Performance comparison, statistical analysis
7. **Discussion:** Findings, implications, limitations
8. **Conclusion:** Contribution, future work

---

## Summary

DataSentry-AI proposes a novel framework for linking data quality to decision safety in AI systems. The research methodology includes:

1. ✅ Clear research questions
2. ✅ Identified research gap
3. ✅ Controlled experimental design
4. ✅ Multiple baseline comparisons
5. ✅ Comprehensive evaluation metrics
6. ✅ Statistical validation
7. ✅ Reproducibility measures
8. ✅ Honest limitation disclosure

**Next Steps:**
1. Implement corruption framework
2. Run experiments
3. Analyze results
4. Write research paper
5. Open-source code and data

---

*Last Updated: 2026-09-14*
