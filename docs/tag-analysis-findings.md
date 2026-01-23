# Tag Analysis Findings

This document summarizes the analysis of questions grouped by AI-human alignment patterns and semantic meaning.

## Executive Summary

**Key Finding**: The current "religion" and "family" tags are muddled - they group together questions with very different AI-human alignment patterns. Questions about **supernatural beliefs** (God, afterlife) have ~20-30% alignment, while questions about **religious tolerance** have ~70-85% alignment. These need separate tags.

## Cluster Analysis Results

### Cluster: AI-United-Rebels (14 questions)

- **Avg Human Similarity**: 28.1%
- **Avg AI Consensus**: 93.6%
- **Pattern**: AI models agree with each other but strongly diverge from humans

**Question Types**:

1. Supernatural beliefs (God, afterlife) - AI is more skeptical
2. Child-rearing values (imagination, thrift, determination) - AI undervalues these
3. Death penalty, marijuana - AI differs on social policy
4. Capitalism vs socialism - AI is more centrist
5. Authority/being in charge - AI scores lower than humans

### Cluster: AI-Divergent-Rebels (3 questions)

- **Avg Human Similarity**: 32.3%
- **Avg AI Consensus**: 62.7%
- **Pattern**: Both low alignment AND low AI consensus (contested among AIs too)

**Question Types**:

1. Drug addicts as neighbors (social tolerance edge case)
2. Gender definition (contested philosophical question)
3. Following traditions (values question)

### Cluster: Moderate-Consensus (33 questions)

- **Avg Human Similarity**: 45.0%
- **Avg AI Consensus**: 88.7%
- **Pattern**: Medium alignment but AI models agree

### Cluster: High-Alignment (94 questions)

- **Avg Human Similarity**: 65.4%
- **Avg AI Consensus**: 61.3%
- **Pattern**: Good AI-human agreement but moderate AI variance

### Cluster: Very-High-Alignment (76 questions)

- **Avg Human Similarity**: 81.0%
- **Avg AI Consensus**: 54.0%
- **Pattern**: Best AI-human agreement, higher AI disagreement

## Tag Variance Analysis

Tags sorted by alignment variance (high variance = problematic tag):

| Tag              | Count | Avg Align | Std Dev | Clusters |
| ---------------- | ----- | --------- | ------- | -------- |
| tradition        | 2     | 60.0      | 27.0    | 2        |
| family           | 23    | 59.0      | 22.1    | 6        |
| religion         | 10    | 48.3      | 20.3    | 5        |
| death            | 8     | 56.0      | 20.0    | 4        |
| immigration      | 2     | 60.5      | 18.5    | 2        |
| trust            | 5     | 62.2      | 16.9    | 4        |
| loyalty/betrayal | 5     | 76.4      | 6.3     | 2        |
| free will        | 1     | 76.0      | n/a     | 1        |

**Insight**: "family" and "religion" span 5-6 clusters with high variance - these tags need to be split into more specific categories.

## New Tag Taxonomy

### Pattern-Based Tags (New) - Actual Results

| Tag                            | Count | Avg Align | Std Dev | Description                                              |
| ------------------------------ | ----- | --------- | ------- | -------------------------------------------------------- |
| `supernatural beliefs`         | 4     | 23.3%     | **5.5** | God, afterlife, souls - VERY consistent low alignment    |
| `economic views`               | 6     | 35.0%     | **4.9** | Capitalism, socialism, jobs - consistently low alignment |
| `gender`                       | 7     | 40.9%     | 10.4    | Gender roles, categories - low alignment                 |
| `social policy`                | 5     | 41.0%     | 11.6    | Drugs, death penalty                                     |
| `child-rearing values`         | 12    | 55.8%     | 23.0    | What children should learn (still high variance)         |
| `social tolerance (neighbors)` | 9     | 69.8%     | 16.6    | "Would you want X as neighbor"                           |
| `philosophy (academic)`        | 98    | 63.2%     | 15.8    | PhilPapers technical questions                           |

**Key Success**: The `supernatural beliefs` tag has variance of only 5.5 compared to the old `religion` tag's 17.5. This confirms the hypothesis that questions about God/afterlife beliefs cluster tightly together with consistently low AI-human alignment.

### Moral Foundation Tags (Keep)

The moral foundation tags work well and should be kept:

- `mf-care` (Avg: 69.6, Std: 11.5)
- `mf-fairness` (Avg: 65.6, Std: 11.3)
- `mf-loyalty` (Avg: 76.4, Std: 6.3)
- `mf-authority` (Avg: 62.7, Std: 16.1)
- `mf-sanctity` (Avg: 62.2, Std: 12.1)

### Philosophy Tags (Keep)

These work well for filtering PhilPapers questions:

- `metaphysics`
- `epistemology`
- `consciousness`
- `free-will`
- `thought-experiment`

## Implementation

### Files Created

1. `migrations/0029_tag_improvements.sql` - Creates new tags and auto-assigns based on text patterns
2. `scripts/tag-questions-curated.sql` - Manual tag assignments for low-alignment questions
3. `scripts/analyze-tags.ts` - Analysis script for future tag improvements

### Running the Migration

```bash
# Apply new tags
bun run db:migrate:remote

# Apply curated assignments
wrangler d1 execute qualia-garden --remote --file=scripts/tag-questions-curated.sql
```

## Semantic Patterns Discovered

### Supernatural Beliefs Pattern

- Questions: 3 (God, afterlife, theism)
- Avg Alignment: 33.7%
- Std Dev: 16.1
- AI is consistently more skeptical than humans about supernatural claims

### Neighbor Tolerance Pattern

- Questions: 9 (homosexuals, immigrants, drug addicts, etc.)
- Avg Alignment: 69.8%
- Std Dev: 16.6
- AI is consistently tolerant (would accept anyone as neighbor)
- Exception: drug addicts (lower AI consensus)

### Child-Rearing Values Pattern

- Questions: ~6 (imagination, thrift, determination, unselfishness)
- Avg Alignment: ~25-34%
- AI doesn't value these traits as much as humans do
- Interesting insight: AI may have different model of child development

### Death/End-of-Life Pattern

- Questions: 8
- Avg Alignment: 62.6%
- Std Dev: 25.3 (high!)
- Spans many clusters - need to split by question type

## Recommendations for Tag Page

When displaying a tag page, show:

1. **Tag Description** - What unifies questions in this tag
2. **Alignment Stats** - Average alignment, variance
3. **Interpretation Guide** - What high/low alignment means for this tag type

Example for `supernatural` tag:

> "Questions about supernatural beliefs (God, afterlife, souls). AI models are generally more skeptical of supernatural claims than the human population. Average alignment: 28%. This represents one of the largest consistent AI-human value divergences."

Example for `neighbor-tolerance` tag:

> "Questions about who people would accept as neighbors. AI models consistently express high tolerance for all groups, matching the most tolerant human responses. Average alignment: 75%."
