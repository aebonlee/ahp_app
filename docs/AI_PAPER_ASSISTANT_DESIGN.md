# 🤖 AI 논문 작성 지원 시스템 설계 문서

## 📌 개요

AHP 및 퍼지 AHP 연구 논문 작성자를 위한 AI 기반 자동 논문 생성 및 분석 지원 시스템

---

## 🎯 핵심 목표

1. **AHP/퍼지 AHP 방법론 자동 설명** - 이론, 수식, 절차 자동 생성
2. **프로젝트 결과 기반 논문 섹션 생성** - 방법론, 결과, 고찰 자동 작성
3. **AI 기반 결과 해석** - GPT-4를 활용한 지능형 분석 및 통찰
4. **논문 품질 검증** - 방법론 타당성, 통계 검정 제안
5. **학술 자료 생성** - 표, 그림, 참고문헌 자동 생성

---

## 📂 메뉴 구조

```
📊 관리자 대시보드
├─ 내 프로젝트
├─ 프로젝트 생성
├─ 결과 분석
└─ 🤖 AI 논문 지원 ⭐ NEW!
   │
   ├─ 1️⃣ AHP 방법론 설명
   │  ├─ AHP 이론 자동 생성
   │  ├─ AHP 수식 렌더링
   │  ├─ AHP 절차 단계별 설명
   │  └─ AHP 참고문헌 추천
   │
   ├─ 2️⃣ 퍼지 AHP 방법론 설명
   │  ├─ 퍼지 AHP 이론 자동 생성
   │  ├─ 퍼지 수식 렌더링 (TFN)
   │  ├─ 퍼지 척도 표 생성
   │  └─ 퍼지 AHP 참고문헌
   │
   ├─ 3️⃣ 내 프로젝트 논문 작성
   │  ├─ 방법론 섹션 자동 생성
   │  ├─ 결과 섹션 자동 생성
   │  ├─ 고찰 섹션 초안 생성
   │  └─ 연구 한계 자동 제시
   │
   ├─ 4️⃣ AI 결과 분석 & 해석
   │  ├─ AI 결과 자동 해석
   │  ├─ 가중치 패턴 분석
   │  ├─ 대안 순위 설명
   │  └─ 일관성 문제 진단
   │
   ├─ 5️⃣ 논문 품질 검증
   │  ├─ 방법론 적용 타당성 검증
   │  ├─ 통계 검정 방법 추천
   │  └─ AI 모의 심사
   │
   ├─ 6️⃣ 학술 자료 생성
   │  ├─ 논문용 표 생성 (APA/IEEE)
   │  ├─ 논문용 그림 생성
   │  ├─ 표/그림 캡션 자동 생성
   │  └─ LaTeX 형식 내보내기
   │
   └─ 7️⃣ AI 챗봇 도우미
      └─ 논문 작성 질문 답변 (GPT-4)
```

---

## 🔧 주요 기능 상세

### 1️⃣ AHP 방법론 설명 생성기

#### **AhpMethodologyExplainer.tsx**

**목적**: 일반 AHP 이론을 자동으로 설명하는 텍스트 생성

**출력 내용**:
```markdown
## 3.1 AHP(Analytic Hierarchy Process)

AHP는 Saaty(1980)가 개발한 다기준 의사결정 방법론으로, 
복잡한 의사결정 문제를 계층 구조로 분해하여 분석하는 기법이다.

### 3.1.1 AHP의 기본 원리
1. 계층 구조 설정
2. 쌍대비교를 통한 판단
3. 가중치 계산
4. 일관성 검증

### 3.1.2 쌍대비교 척도
Saaty의 9점 척도를 사용하며, 1점(똑같이 중요)부터 
9점(절대적으로 중요)까지의 범위를 갖는다.

[사용자 프로젝트 기반 설명 자동 삽입]
본 연구에서는 {프로젝트명}에 대해 {평가기준 개수}개의 
평가기준과 {대안 개수}개의 대안을 설정하였다.
```

**주요 함수**:
```typescript
interface AhpExplanation {
  introduction: string;        // AHP 소개
  hierarchyExplanation: string; // 계층구조 설명
  pairwiseExplanation: string; // 쌍대비교 설명
  weightCalculation: string;    // 가중치 계산 설명
  consistencyCheck: string;     // 일관성 검증 설명
  projectSpecific: string;      // 프로젝트 맞춤 설명
}

function generateAhpMethodology(project: Project): AhpExplanation {
  // 프로젝트 정보 기반 맞춤 설명 생성
  // AI(GPT-4) 또는 템플릿 기반
}
```

---

#### **AhpFormulasRenderer.tsx**

**목적**: AHP 수식을 LaTeX/MathML 형식으로 렌더링

**렌더링 수식**:

1. **쌍대비교 행렬**
```latex
A = \begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}
\end{bmatrix}
```

2. **가중치 계산 (고유벡터 방법)**
```latex
Aw = \lambda_{max}w
```

3. **일관성 지수 (CI)**
```latex
CI = \frac{\lambda_{max} - n}{n - 1}
```

4. **일관성 비율 (CR)**
```latex
CR = \frac{CI}{RI}
```

**컴포넌트**:
```typescript
<FormulaRenderer 
  formula="eigenvalue" 
  data={evaluationMatrix} 
  format="latex" // or 'mathml', 'image'
/>
```

---

#### **AhpProcedureGenerator.tsx**

**목적**: AHP 수행 절차를 단계별로 자동 생성

**출력 예시**:
```markdown
## 3.2 연구 절차

### 3.2.1 1단계: 계층구조 설정
본 연구의 목표는 "{프로젝트 목표}"이며, 
다음과 같은 3단계 계층구조를 구성하였다:

- Level 1 (목표): {목표명}
- Level 2 (평가기준): {기준1}, {기준2}, ..., {기준n}
- Level 3 (대안): {대안1}, {대안2}, ..., {대안m}

[계층구조 다이어그램 자동 삽입]

### 3.2.2 2단계: 쌍대비교 수행
{평가자 수}명의 전문가를 대상으로 설문조사를 실시하였다.
평가자들은 Saaty의 9점 척도를 사용하여 
{총 비교 횟수}회의 쌍대비교를 수행하였다.

### 3.2.3 3단계: 가중치 계산
고유벡터 방법(eigenvector method)을 사용하여 
각 요소의 가중치를 산출하였다.

### 3.2.4 4단계: 일관성 검증
CR < 0.1 기준을 적용하여 응답의 일관성을 검증하였다.
본 연구에서 {일관성 통과율}의 응답이 일관성 기준을 만족하였다.
```

---

#### **AhpReferenceManager.tsx**

**목적**: AHP 관련 주요 참고문헌 자동 추천 및 관리

**추천 문헌 DB**:
```typescript
const ahpReferences = [
  {
    id: 'saaty1980',
    citation: 'Saaty, T. L. (1980). The analytic hierarchy process. McGraw-Hill.',
    bibTex: '@book{saaty1980, ...}',
    category: 'foundational',
    usage: 'AHP 기본 이론'
  },
  {
    id: 'saaty2008',
    citation: 'Saaty, T. L. (2008). Decision making with the analytic hierarchy process. International Journal of Services Sciences, 1(1), 83-98.',
    category: 'methodology',
    usage: 'AHP 적용 방법론'
  },
  // ... 더 많은 참고문헌
];
```

**기능**:
- 연구 분야별 참고문헌 추천
- 인용 형식 자동 변환 (APA, IEEE, Chicago)
- BibTeX 내보내기
- DOI 링크 자동 생성

---

### 2️⃣ 퍼지 AHP 방법론 설명 생성기

#### **FuzzyAhpMethodologyExplainer.tsx**

**출력 내용**:
```markdown
## 3.3 퍼지 AHP(Fuzzy AHP)

### 3.3.1 퍼지 이론의 필요성
전통적인 AHP는 평가자의 판단을 정확한 수치로 표현한다는 한계가 있다.
그러나 실제 의사결정 환경에서는 불확실성과 모호성이 존재하므로,
퍼지 이론을 AHP에 접목한 퍼지 AHP가 제안되었다(Van Laarhoven & Pedrycz, 1983).

### 3.3.2 삼각퍼지수(TFN)
본 연구에서는 삼각퍼지수(Triangular Fuzzy Number, TFN)를 사용하였다.
TFN은 (l, m, u)로 표현되며, 각각 최소값, 가장 가능성 높은 값, 최대값을 의미한다.

### 3.3.3 퍼지 척도
언어적 변수를 TFN으로 변환하는 척도는 다음과 같다:
[퍼지 척도 표 자동 생성]

### 3.3.4 퍼지 가중치 계산
Chang의 Extent Analysis 방법(1996)을 사용하여 
퍼지 가중치를 계산하고 비퍼지화하였다.
```

---

#### **FuzzyAhpFormulasRenderer.tsx**

**렌더링 수식**:

1. **삼각퍼지수 정의**
```latex
\tilde{a} = (l, m, u)
```

2. **퍼지수 덧셈**
```latex
\tilde{a} \oplus \tilde{b} = (l_1 + l_2, m_1 + m_2, u_1 + u_2)
```

3. **퍼지수 곱셈**
```latex
\tilde{a} \otimes \tilde{b} = (l_1 \times l_2, m_1 \times m_2, u_1 \times u_2)
```

4. **퍼지수 역수**
```latex
\tilde{a}^{-1} = (\frac{1}{u}, \frac{1}{m}, \frac{1}{l})
```

5. **비퍼지화 (COG 방법)**
```latex
BNP = \frac{(u - l) + (m - l)}{3} + l
```

---

#### **FuzzyScaleTableGenerator.tsx**

**자동 생성 표**:

| 언어적 변수 | TFN (l, m, u) | 설명 |
|------------|---------------|------|
| 똑같이 중요 (EI) | (1, 1, 1) | 두 요소가 동등하게 중요 |
| 약간 중요 (WI) | (1, 2, 3) | 한 요소가 다른 요소보다 약간 중요 |
| 중요 (MI) | (2, 3, 4) | 한 요소가 다른 요소보다 중요 |
| 매우 중요 (SI) | (4, 5, 6) | 한 요소가 다른 요소보다 매우 중요 |
| 절대적 중요 (AI) | (7, 8, 9) | 한 요소가 다른 요소보다 절대적으로 중요 |

---

#### **FuzzyAhpReferenceManager.tsx**

**퍼지 AHP 주요 문헌**:
```typescript
const fuzzyAhpReferences = [
  {
    id: 'vanlaarhoven1983',
    citation: 'Van Laarhoven, P. J. M., & Pedrycz, W. (1983). A fuzzy extension of Saaty\'s priority theory. Fuzzy Sets and Systems, 11(1-3), 229-241.',
    category: 'foundational'
  },
  {
    id: 'chang1996',
    citation: 'Chang, D. Y. (1996). Applications of the extent analysis method on fuzzy AHP. European Journal of Operational Research, 95(3), 649-655.',
    category: 'calculation'
  },
  // ...
];
```

---

### 3️⃣ 프로젝트 맞춤 논문 섹션 생성

#### **MethodologySectionGenerator.tsx**

**목적**: 사용자의 프로젝트 데이터를 기반으로 방법론 섹션 자동 작성

**입력 데이터**:
```typescript
interface ProjectData {
  projectName: string;
  projectType: 'ahp' | 'fuzzy_ahp';
  goal: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  evaluators: Evaluator[];
  hierarchyLevels: number;
}
```

**생성 로직**:
```typescript
async function generateMethodologySection(project: ProjectData): Promise<string> {
  const prompt = `
다음 AHP 프로젝트 정보를 바탕으로 학술 논문의 방법론 섹션을 작성해주세요:

- 프로젝트명: ${project.projectName}
- 방법: ${project.projectType === 'ahp' ? '일반 AHP' : '퍼지 AHP'}
- 연구 목표: ${project.goal}
- 평가기준: ${project.criteria.map(c => c.name).join(', ')}
- 대안: ${project.alternatives.map(a => a.name).join(', ')}
- 평가자 수: ${project.evaluators.length}명

다음 형식으로 작성:
3.1 연구 설계
3.2 계층구조 구성
3.3 데이터 수집
3.4 분석 방법
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000
  });
  
  return response.choices[0].message.content;
}
```

**출력 예시**:
```markdown
## 3. 연구 방법론

### 3.1 연구 설계
본 연구는 {목표}를 달성하기 위해 AHP 기법을 적용하였다.
전문가 {n}명을 대상으로 설문조사를 실시하였으며,
{기간}에 걸쳐 데이터를 수집하였다.

### 3.2 계층구조 구성
3단계 계층구조로 설계하였으며, 다음과 같이 구성된다:
- Level 1: {목표}
- Level 2: {기준1}, {기준2}, ..., {기준n}
- Level 3: {대안1}, {대안2}, ..., {대안m}

### 3.3 데이터 수집
쌍대비교 설문지를 이용하여 데이터를 수집하였다.
각 평가자는 총 {비교횟수}회의 쌍대비교를 수행하였다.

### 3.4 분석 방법
고유벡터 방법을 사용하여 가중치를 산출하였으며,
일관성 비율(CR)이 0.1 미만인 응답만을 분석에 포함하였다.
```

---

#### **ResultsSectionGenerator.tsx**

**목적**: 계산된 결과를 바탕으로 결과 섹션 자동 작성

**입력 데이터**:
```typescript
interface AnalysisResults {
  criteriaWeights: { name: string, weight: number }[];
  alternativeScores: { name: string, score: number, rank: number }[];
  consistencyRatios: number[];
  averageCR: number;
  sensitivityAnalysis?: SensitivityData;
}
```

**생성 예시**:
```markdown
## 4. 연구 결과

### 4.1 평가기준 가중치
쌍대비교 결과를 종합한 평가기준의 가중치는 <표 1>과 같다.
{기준1}이 0.XXX으로 가장 높은 가중치를 나타냈으며,
다음으로 {기준2}(0.XXX), {기준3}(0.XXX) 순으로 나타났다.

<표 1> 평가기준 가중치
[자동 생성 표]

### 4.2 대안 평가 결과
각 대안의 종합 점수는 <표 2>와 같다.
{대안1}이 0.XXX으로 1순위를 차지하였으며,
{대안2}(0.XXX), {대안3}(0.XXX)이 그 뒤를 이었다.

<표 2> 대안별 종합 점수 및 순위
[자동 생성 표]

### 4.3 일관성 검증
전체 응답자의 평균 일관성 비율(CR)은 0.XXX로,
Saaty가 제시한 기준값 0.1을 {만족/초과}하였다.
```

---

#### **DiscussionGenerator.tsx**

**목적**: AI가 결과를 해석하고 고찰 섹션 초안 생성

**AI 프롬프트 예시**:
```typescript
const prompt = `
다음은 AHP 분석 결과입니다:

평가기준 가중치:
- 비용: 0.412
- 품질: 0.289
- 납기: 0.187
- 서비스: 0.112

대안 순위:
1. 공급업체 A: 0.385
2. 공급업체 B: 0.298
3. 공급업체 C: 0.317

이 결과를 바탕으로 학술 논문의 고찰(Discussion) 섹션을 작성해주세요.
다음 내용을 포함:
1. 주요 발견사항 해석
2. 이론적/실무적 시사점
3. 선행연구와의 비교
4. 예상치 못한 결과에 대한 설명
`;
```

**출력 예시**:
```markdown
## 5. 고찰

### 5.1 주요 발견사항
본 연구 결과, 비용(0.412)이 가장 중요한 평가기준으로 나타났다.
이는 {산업/분야}에서 가격 경쟁력이 여전히 핵심 요소임을 시사한다.

### 5.2 이론적 시사점
본 연구는 {이론}을 실증적으로 검증하였다는 점에서 의의가 있다.
특히 {발견사항}은 기존 연구(저자, 연도)의 주장을 뒷받침한다.

### 5.3 실무적 시사점
의사결정자는 {대안1}을 우선적으로 고려해야 한다.
그러나 {기준2}의 중요도도 무시할 수 없으므로,
{대안2}를 차선책으로 검토할 필요가 있다.
```

---

### 4️⃣ AI 결과 분석 & 해석

#### **AiResultsInterpreter.tsx**

**목적**: GPT-4가 AHP 결과를 자동으로 해석하고 통찰 제공

**기능**:
1. 가중치 분포 패턴 분석
2. 대안 간 점수 차이 유의성 판단
3. 민감도 분석 결과 해석
4. 실무적 권고사항 도출

**예시 출력**:
```
💡 AI 분석 결과

**주요 발견사항:**
1. 비용이 압도적으로 중요한 기준으로 나타났습니다 (41.2%)
   → 의사결정에서 경제적 요인이 지배적입니다.

2. 공급업체 A와 C의 점수 차이가 매우 작습니다 (0.068)
   → 두 대안은 실질적으로 동등한 수준으로 평가할 수 있습니다.

3. 민감도 분석 결과, 비용 가중치가 30% 이하로 감소하면 
   공급업체 C가 1순위로 역전됩니다.
   → 의사결정이 비용 기준에 매우 민감합니다.

**권고사항:**
- 단기적: 공급업체 A 선택 (비용 우위)
- 장기적: 품질 개선 시 공급업체 C 고려
- 리스크 관리: 두 공급업체 모두와 관계 유지
```

---

#### **WeightInterpretationAI.tsx**

**기능**: 가중치 패턴을 AI가 자동 분석

```typescript
function interpretWeightPattern(weights: Weight[]): Interpretation {
  const sortedWeights = [...weights].sort((a, b) => b.value - a.value);
  const topWeight = sortedWeights[0];
  const gapToSecond = topWeight.value - sortedWeights[1].value;
  
  let interpretation = '';
  
  if (gapToSecond > 0.2) {
    interpretation = `${topWeight.name}이(가) 압도적으로 중요한 기준입니다. `;
    interpretation += `이는 의사결정에서 ${topWeight.name}이(가) 결정적 역할을 한다는 것을 의미합니다.`;
  } else if (gapToSecond < 0.05) {
    interpretation = `상위 2개 기준(${sortedWeights[0].name}, ${sortedWeights[1].name})의 가중치가 비슷합니다. `;
    interpretation += `두 기준 모두 균형있게 고려해야 합니다.`;
  }
  
  // GPT-4 추가 분석
  const aiInterpretation = await callGPT4ForWeightAnalysis(weights);
  
  return {
    summary: interpretation,
    aiInsight: aiInterpretation,
    recommendations: generateRecommendations(weights)
  };
}
```

---

### 5️⃣ 논문 품질 검증 도구

#### **MethodologyValidator.tsx**

**검증 항목**:
```typescript
interface ValidationChecklist {
  hierarchyDepth: {
    value: number;
    valid: boolean;
    message: string; // "3-5 단계가 적절합니다"
  };
  numberOfCriteria: {
    value: number;
    valid: boolean;
    message: string; // "7±2개가 권장됩니다"
  };
  numberOfEvaluators: {
    value: number;
    valid: boolean;
    message: string; // "최소 3명 이상 권장"
  };
  consistencyRatio: {
    value: number;
    valid: boolean;
    message: string; // "CR < 0.1 만족"
  };
}
```

**출력 예시**:
```
✅ 방법론 타당성 검증 결과

계층 구조: ✅ 적절 (3단계)
평가 기준 수: ⚠️ 주의 (9개 - 7±2 권장)
평가자 수: ✅ 적절 (5명)
일관성: ✅ 우수 (평균 CR = 0.067)

💡 개선 제안:
평가 기준이 다소 많습니다. 유사한 기준을 통합하거나 
상위 범주로 묶는 것을 고려하세요.
```

---

#### **PeerReviewSimulator.tsx**

**목적**: AI가 예상 심사 의견을 시뮬레이션

**출력 예시**:
```
🎓 AI 모의 심사 결과

**Reviewer #1 (긍정적 의견)**
✅ 연구 방법론이 적절하며, 일관성 검증이 철저함
✅ 결과 해석이 논리적이고 명확함

❓ 예상 질문:
Q1: 평가자 선정 기준이 무엇인가요?
Q2: 퍼지 AHP 대신 일반 AHP를 선택한 이유는?

**Reviewer #2 (비판적 의견)**
⚠️ 표본 크기가 작아 일반화에 한계가 있음
⚠️ 민감도 분석 결과가 부족함

💡 보완 제안:
- 평가자 배경 정보를 표로 제시
- 추가 통계 검정 수행 (Kendall's W 등)
- 민감도 분석을 더 상세히 기술
```

---

### 6️⃣ 학술 자료 생성

#### **TableGenerator.tsx**

**기능**: 논문용 표를 APA/IEEE 스타일로 자동 생성

**예시**:

```markdown
Table 1
Criteria Weights and Ranking

| Criterion | Weight | Rank | CR    |
|-----------|--------|------|-------|
| Cost      | 0.412  | 1    | 0.054 |
| Quality   | 0.289  | 2    | 0.067 |
| Delivery  | 0.187  | 3    | 0.042 |
| Service   | 0.112  | 4    | 0.038 |

Note. CR = Consistency Ratio. All CR values are below 0.1, 
indicating acceptable consistency.
```

**지원 형식**:
- APA 7th edition
- IEEE
- Chicago
- Nature
- Custom

---

#### **FigureGenerator.tsx**

**자동 생성 그림**:
1. 계층구조 다이어그램
2. 가중치 막대 차트
3. 대안 비교 레이더 차트
4. 민감도 분석 그래프
5. 일관성 분포 히스토그램

**예시 코드**:
```typescript
<FigureGenerator
  type="hierarchy"
  data={projectHierarchy}
  style="academic" // or 'presentation', 'poster'
  format="png" // or 'svg', 'pdf'
  dpi={300} // 논문 출판용 고해상도
  colorScheme="grayscale" // 흑백 논문용
/>
```

---

#### **LatexExporter.tsx**

**기능**: 수식과 표를 LaTeX 형식으로 내보내기

**출력 예시**:
```latex
\begin{table}[h]
\centering
\caption{Evaluation Criteria Weights}
\label{tab:weights}
\begin{tabular}{lcc}
\hline
Criterion & Weight & Rank \\
\hline
Cost & 0.412 & 1 \\
Quality & 0.289 & 2 \\
Delivery & 0.187 & 3 \\
Service & 0.112 & 4 \\
\hline
\end{tabular}
\end{table}

The consistency ratio (CR) was calculated as:
\begin{equation}
CR = \frac{CI}{RI} = \frac{0.067}{0.90} = 0.074
\end{equation}
```

---

### 7️⃣ AI 챗봇 도우미

#### **AiAssistantChat.tsx**

**목적**: 논문 작성 중 발생하는 질문에 실시간 답변

**예시 대화**:
```
👤 사용자: 일관성 비율이 0.12가 나왔는데 어떻게 해야 하나요?

🤖 AI: 일관성 비율(CR)이 0.12로 기준값 0.1을 초과했습니다. 
다음 방법을 시도해보세요:

1. 가장 일관성이 낮은 쌍대비교를 찾아 재평가
   → 시스템에서 "일관성 개선 제안" 기능을 사용하세요

2. 평가자 교육 강화
   → 척도의 의미를 명확히 설명

3. 논문에서 언급
   → "CR이 다소 높으나 0.2 이하로 수용 가능하다는 
      연구도 있음(저자, 연도)" 형식으로 기술

참고문헌:
- Saaty (1980): CR < 0.1 권장
- Franek & Kresta (2014): CR < 0.2 수용 가능
```

---

## 🔌 백엔드 API 설계

### AI 논문 생성 API

```python
# Django REST Framework API

POST /api/ai/paper-generation/
{
  "project_id": 123,
  "sections": ["methodology", "results", "discussion"],
  "style": "apa",  # or 'ieee', 'chicago'
  "language": "ko"  # or 'en'
}

Response:
{
  "methodology_section": "...",
  "results_section": "...",
  "discussion_section": "...",
  "tables": [...],
  "figures": [...],
  "references": [...]
}
```

---

### OpenAI GPT-4 연동

```typescript
// services/openaiService.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

export async function generatePaperSection(
  sectionType: 'methodology' | 'results' | 'discussion',
  projectData: ProjectData
): Promise<string> {
  const systemPrompt = `당신은 AHP 논문 작성 전문가입니다. 
학술 논문 스타일로 ${sectionType} 섹션을 작성하세요.`;
  
  const userPrompt = buildPrompt(sectionType, projectData);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2500
  });
  
  return response.choices[0].message.content;
}
```

---

## 📊 데이터베이스 스키마

```python
# Django Models

class AiGeneratedSection(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    section_type = models.CharField(max_length=50)  # methodology, results, etc.
    content = models.TextField()
    language = models.CharField(max_length=10, default='ko')
    style = models.CharField(max_length=20, default='apa')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    
    # AI 메타데이터
    model_used = models.CharField(max_length=50)  # gpt-4, gpt-3.5-turbo
    tokens_used = models.IntegerField(default=0)
    generation_time = models.FloatField(default=0)  # seconds

class AiInterpretation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    interpretation_type = models.CharField(max_length=50)  # weight, ranking, consistency
    ai_analysis = models.TextField()
    recommendations = models.JSONField(default=list)
    confidence_score = models.FloatField(default=0.0)  # 0-1
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🎨 UI/UX 디자인

### AI 논문 지원 대시보드

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI 논문 작성 지원                              [도움말] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📝 프로젝트: "공급업체 선정을 위한 AHP 분석"              │
│  📊 방법: 일반 AHP                                        │
│  👥 평가자: 5명                                           │
│  ✅ 일관성: 평균 CR = 0.067 (우수)                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [1️⃣ AHP 방법론 설명]  [2️⃣ 퍼지 AHP 설명]               │
│  [3️⃣ 논문 섹션 생성]   [4️⃣ AI 결과 해석]                │
│  [5️⃣ 품질 검증]       [6️⃣ 학술 자료]                     │
│  [7️⃣ AI 챗봇 💬]                                        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  💡 빠른 시작                                             │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │ 🚀 원클릭 논문 생성                           │       │
│  │                                              │       │
│  │ 방법론 + 결과 + 고찰 섹션을 한 번에 생성       │       │
│  │                                              │       │
│  │ [논문 자동 생성 시작] (약 2분 소요)            │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 개발 우선순위

### Phase 1: 기본 AI 기능 (핵심)
1. ✅ OpenAI API 연동
2. ✅ AHP 방법론 자동 설명
3. ✅ 프로젝트 기반 논문 섹션 생성
4. ✅ 기본 표/그림 생성

### Phase 2: 고급 분석 (부가가치)
1. ✅ AI 결과 해석 및 통찰
2. ✅ 가중치 패턴 분석
3. ✅ 민감도 분석 AI 설명
4. ✅ 일관성 개선 제안

### Phase 3: 퍼지 AHP 지원
1. ✅ 퍼지 AHP 방법론 설명
2. ✅ 퍼지 수식 렌더링
3. ✅ 퍼지 결과 해석

### Phase 4: 논문 품질 향상
1. ✅ 방법론 타당성 검증
2. ✅ AI 모의 심사
3. ✅ LaTeX 내보내기
4. ✅ 참고문헌 관리

---

## 💰 비용 추정 (OpenAI API)

| 기능 | 예상 토큰 | GPT-4 비용 | GPT-3.5 비용 |
|------|-----------|-----------|-------------|
| 방법론 섹션 생성 | ~1,500 | $0.045 | $0.002 |
| 결과 섹션 생성 | ~1,000 | $0.030 | $0.001 |
| AI 결과 해석 | ~800 | $0.024 | $0.001 |
| 챗봇 대화 (1회) | ~500 | $0.015 | $0.001 |

**총 예상 비용**: 논문 1편당 약 $0.10 ~ $0.15 (GPT-4 기준)

**비용 절감 방안**:
- 단순 설명: GPT-3.5-turbo 사용
- 복잡한 분석: GPT-4 사용
- 캐싱으로 중복 요청 방지

---

## 📝 구현 체크리스트

### Frontend
- [ ] AiPaperAssistantDashboard.tsx
- [ ] AhpMethodologyExplainer.tsx
- [ ] FuzzyAhpMethodologyExplainer.tsx
- [ ] MethodologySectionGenerator.tsx
- [ ] ResultsSectionGenerator.tsx
- [ ] AiResultsInterpreter.tsx
- [ ] TableGenerator.tsx
- [ ] FigureGenerator.tsx
- [ ] AiAssistantChat.tsx
- [ ] services/openaiService.ts
- [ ] services/paperGenerationService.ts

### Backend
- [ ] Django Model: AiGeneratedSection
- [ ] Django Model: AiInterpretation
- [ ] API: /api/ai/paper-generation/
- [ ] API: /api/ai/interpretation/
- [ ] API: /api/ai/chat/
- [ ] OpenAI API 통합

### Utils
- [ ] utils/formulaRenderer.ts (LaTeX 렌더링)
- [ ] utils/referenceFormatter.ts (참고문헌 형식)
- [ ] utils/tableStyler.ts (APA/IEEE 스타일)

---

## 🎯 기대 효과

1. **논문 작성 시간 80% 단축**
   - 방법론 섹션: 2시간 → 10분
   - 결과 섹션: 1시간 → 5분

2. **논문 품질 향상**
   - 방법론 기술의 일관성 확보
   - AI 검증으로 오류 사전 발견
   - 학술적 표현 개선

3. **연구 효율성 증대**
   - 연구자는 해석과 통찰에 집중
   - 반복 작업은 AI가 자동화

4. **차별화된 서비스**
   - 국내외 유일한 AHP 논문 AI 지원 플랫폼
   - 연구자/학생 시장 공략 가능

---

**마지막 업데이트**: 2025-01-28
**작성자**: Claude (AI Assistant)
**버전**: 1.0