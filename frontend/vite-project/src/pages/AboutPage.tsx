import { useNavigate } from "react-router-dom"
import styled, { keyframes } from "styled-components"
import MatrixHelix from "../components/MatrixHelix"

const G = {
  main:    "rgb(46, 213, 115)",
  mainRgb: "46, 213, 115",
  dim:     "rgba(46, 213, 115, 0.55)",
  border:  "rgba(46, 213, 115, 0.18)",
  bg:      "rgba(46, 213, 115, 0.04)",
  text:    "#e5e5e5",
  muted:   "rgba(229,229,229,0.72)",
}

/* ─── Keyframes ──────────────────────────────────────────────── */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`

const scanline = keyframes`
  0%   { top: -5%; }
  100% { top: 105%; }
`

const borderGlow = keyframes`
  0%, 100% { border-color: rgba(0,242,234,0.2); }
  50%       { border-color: rgba(0,242,234,0.5); }
`

/* ─── Layout ─────────────────────────────────────────────────── */

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  background: #000;
`

const Scanline = styled.div`
  position: fixed;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(transparent, rgba(0,242,234,0.12), transparent);
  animation: ${scanline} 7s linear infinite;
  pointer-events: none;
  z-index: 50;
`

const Vignette = styled.div`
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%);
  pointer-events: none;
  z-index: 1;
`

const BgCanvas = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
`

const ScrollArea = styled.div`
  position: relative;
  z-index: 5;
  max-width: 900px;
  margin: 0 auto;
  padding: 5rem 2rem 6rem;
`

/* ─── Header ─────────────────────────────────────────────────── */

const BackBtn = styled.button`
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${G.main};
  background: transparent;
  border: 1px solid rgba(${G.mainRgb}, 0.3);
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  margin-bottom: 3rem;
  transition: background 0.2s, border-color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards 0.1s;

  &:hover {
    background: rgba(${G.mainRgb}, 0.08);
    border-color: ${G.main};
  }
`

const PageLabel = styled.div`
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  color: ${G.main};
  letter-spacing: 0.35em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards 0.2s;
`

const PageTitle = styled.h1`
  font-family: "Orbitron", sans-serif;
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 900;
  color: ${G.main};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.5rem;
  text-shadow: 0 0 40px rgba(${G.mainRgb}, 0.35);
  opacity: 0;
  animation: ${fadeUp} 0.6s ease forwards 0.35s;
`

const TitleUnderline = styled.div`
  height: 2px;
  width: 120px;
  background: linear-gradient(90deg, ${G.main}, transparent);
  margin-bottom: 3rem;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards 0.5s;
`

/* ─── Sections ───────────────────────────────────────────────── */

const Section = styled.section<{ $delay?: number }>`
  margin-bottom: 2.5rem;
  border: 1px solid rgba(${G.mainRgb}, 0.15);
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  padding: 2rem 2rem 1.75rem;
  animation: ${borderGlow} 4s ease-in-out infinite;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease forwards ${p => p.$delay || 0.6}s, ${borderGlow} 4s ease-in-out infinite ${p => p.$delay || 0.6}s;
`

const SectionLabel = styled.div`
  font-family: "Fira Code", monospace;
  font-size: 0.65rem;
  color: ${G.dim};
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  opacity: 0.7;
`

const SectionTitle = styled.h2`
  font-family: "Orbitron", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${G.text};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(${G.mainRgb}, 0.15);
`

const Body = styled.p`
  font-family: "Fira Code", monospace;
  font-size: 0.85rem;
  color: ${G.muted};
  line-height: 1.85;
  margin: 0 0 0.75rem;
`

const HighlightWord = styled.span`
  color: ${G.main};
  font-weight: 700;
`

/* ─── Stats Row ──────────────────────────────────────────────── */

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
`

const StatCard = styled.div`
  border: 1px solid rgba(${G.mainRgb}, 0.18);
  background: rgba(${G.mainRgb}, 0.04);
  padding: 1rem;
  text-align: center;
`

const StatValue = styled.div`
  font-family: "Orbitron", sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: ${G.main};
  text-shadow: 0 0 20px rgba(${G.mainRgb}, 0.4);
`

const StatLabel = styled.div`
  font-family: "Fira Code", monospace;
  font-size: 0.65rem;
  color: rgba(${G.mainRgb}, 0.6);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 0.3rem;
`

/* ─── Pipeline ───────────────────────────────────────────────── */

const Pipeline = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  margin-top: 1rem;
  justify-content: center;
`

const PipeNode = styled.div<{ $color?: string }>`
  background: rgba(0,0,0,0.7);
  border: 1px solid ${p => p.$color || G.main}55;
  padding: 0.75rem 1rem;
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  color: ${p => p.$color || G.main};
  text-align: center;
  min-width: 100px;
  letter-spacing: 0.08em;
`

const PipeArrow = styled.div`
  font-family: "Fira Code", monospace;
  font-size: 1rem;
  color: rgba(${G.mainRgb}, 0.4);
  padding: 0 0.3rem;
`

/* ─── Tech Tags ──────────────────────────────────────────────── */

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
`

const Tag = styled.span<{ $color?: string }>`
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: ${p => p.$color || G.main};
  border: 1px solid ${p => p.$color || G.main}55;
  background: ${p => p.$color || G.main}0d;
  padding: 0.3rem 0.75rem;
`

/* ─── Footer CTA ─────────────────────────────────────────────── */

const FooterCta = styled.div`
  text-align: center;
  margin-top: 3rem;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease forwards 2s;
`

const EnterBtn = styled.button`
  --main-color: rgb(46, 213, 115);
  --main-bg-color: rgba(46, 213, 116, 0.36);
  --pattern-color: rgba(46, 213, 116, 0.073);

  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.35rem;
  font-family: "Orbitron", sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--main-color);
  padding: 1rem 3rem;

  background:
    radial-gradient(circle, var(--main-bg-color) 0%, rgba(0,0,0,0) 95%),
    linear-gradient(var(--pattern-color) 1px, transparent 1px),
    linear-gradient(to right, var(--pattern-color) 1px, transparent 1px);
  background-size: cover, 15px 15px, 15px 15px;
  background-position: center, center, center;

  border-image: radial-gradient(circle, var(--main-color) 0%, rgba(0,0,0,0) 100%) 1;
  border-width: 1px 0 1px 0;
  border-style: solid;

  transition: background-size 0.2s ease-in-out, filter 0.2s;

  &:hover {
    background-size: cover, 10px 10px, 10px 10px;
    filter: brightness(1.15) drop-shadow(0 0 14px rgb(46,213,115));
  }
  &:active { filter: hue-rotate(250deg); }
`

/* ─── Component ──────────────────────────────────────────────── */

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <Wrapper>
      <BgCanvas>
        <MatrixHelix
          color="rgb(46, 213, 115)"
          speed={[0.15, 0.55]}
          lowerOpacity={0.35}
          upperOpacity={0.7}
          helixSpeed={0.008}
          minWidth={0.9}
          maxWidth={560}
        />
      </BgCanvas>

      <Scanline />
      <Vignette />

      <ScrollArea>
        <BackBtn onClick={() => navigate("/")}>← Back to Home</BackBtn>

        <PageLabel>⬡ &nbsp; System Documentation &nbsp; ⬡</PageLabel>
        <PageTitle>About NETGUARD IDS</PageTitle>
        <TitleUnderline />
        {/* Overview */}
        <Section $delay={0.6}>
          <SectionLabel>01 / Overview</SectionLabel>
          <SectionTitle>What is NETGUARD IDS?</SectionTitle>
          <Body>
            <HighlightWord>NETGUARD IDS</HighlightWord> is an AI-powered
            Intrusion Detection System (IDS) built to identify and categorize
            malicious network traffic in real time. It uses a two-stage machine
            learning pipeline — first detecting whether traffic is anomalous,
            then classifying the attack type — all trained on the industry-standard{" "}
            <HighlightWord>NSL-KDD</HighlightWord> dataset.
          </Body>
          <Body>
            Designed as a full-stack web application, it allows security
            analysts to upload network traffic CSVs, receive instant AI
            predictions, and explore detailed performance visualizations through
            an interactive dashboard.
          </Body>

          <StatsRow>
            {[
              { value: "85%+", label: "Detection Accuracy" },
              { value: "22,544", label: "KDDTest+ Samples" },
              { value: "125,973", label: "Training Samples" },
              { value: "5", label: "Attack Categories" },

            ].map(s => (
              <StatCard key={s.label}>
                <StatValue>{s.value}</StatValue>
                <StatLabel>{s.label}</StatLabel>
              </StatCard>
            ))}
          </StatsRow>
        </Section>

        {/* Pipeline */}
        <Section $delay={0.85}>
          <SectionLabel>02 / Architecture</SectionLabel>
          <SectionTitle>Two-Stage Detection Pipeline</SectionTitle>
          <Body>
            The system runs every uploaded packet record through two sequential
            models, each specialised for its task:
          </Body>
          <Pipeline>
            <PipeNode>CSV Upload</PipeNode>
            <PipeArrow>→</PipeArrow>
            <PipeNode $color={G.main}>
              SVM<br /><span style={{ opacity: 0.6, fontSize: "0.65rem" }}>Binary: Normal / Attack</span>
            </PipeNode>
            <PipeArrow>→</PipeArrow>
            <PipeNode $color="#a855f7">
              XGBoost<br /><span style={{ opacity: 0.6, fontSize: "0.65rem" }}>5-Class Category</span>
            </PipeNode>
            <PipeArrow>→</PipeArrow>
            <PipeNode $color="#10b981">Results & Report</PipeNode>
          </Pipeline>
          <Body style={{ marginTop: "1.25rem" }}>
            <HighlightWord>Model 1 — SVM (RBF Kernel):</HighlightWord> Acts as
            a binary gatekeeper. Every record is classified as{" "}
            <HighlightWord>Normal</HighlightWord> or{" "}
            <HighlightWord>Attack</HighlightWord>. Normal traffic is passed
            through. Flagged traffic continues to Model 2.
          </Body>
          <Body>
            <HighlightWord>Model 2 — XGBoost (300 estimators):</HighlightWord>{" "}
            Categorises detected attacks into one of five classes:{" "}
            <HighlightWord>DoS</HighlightWord>,{" "}
            <HighlightWord>Probe</HighlightWord>,{" "}
            <HighlightWord>R2L</HighlightWord>,{" "}
            <HighlightWord>U2R</HighlightWord>, or{" "}
            <HighlightWord>Normal</HighlightWord>. This drives the risk level
            and alert priority assigned to each record.
          </Body>
        </Section>

        {/* Dataset */}
        <Section $delay={1.05}>
          <SectionLabel>03 / Dataset</SectionLabel>
          <SectionTitle>NSL-KDD Dataset</SectionTitle>
          <Body>
            The <HighlightWord>NSL-KDD</HighlightWord> dataset is an improved
            version of the original KDD Cup 1999 dataset, widely used as a
            benchmark for network intrusion detection research. It removes
            redundant records and balances class distribution.
          </Body>
          <Body>
            Training is performed on the full{" "}
            <HighlightWord>KDDTrain+</HighlightWord> set (125,973 samples), and
            evaluation is done on the complete{" "}
            <HighlightWord>KDDTest+</HighlightWord> set (22,544 unseen samples)
            — ensuring realistic generalization metrics rather than inflated
            in-sample scores.
          </Body>
          <TagGrid>
            {["DoS", "Probe", "R2L", "U2R", "Normal", "125,973 train rows", "22,544 test rows", "41 features"].map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
          </TagGrid>
        </Section>

        {/* Tech Stack */}
        <Section $delay={1.25}>
          <SectionLabel>04 / Technology</SectionLabel>
          <SectionTitle>Tech Stack</SectionTitle>
          <Body>
            Built as a production-grade full-stack application with a clean
            separation between the ML backend and the interactive frontend.
          </Body>
          <TagGrid>
            {[
              { label: "FastAPI", color: "#10b981" },
              { label: "scikit-learn (SVM)", color: G.main },
              { label: "XGBoost", color: "#a855f7" },
              { label: "React + Vite", color: G.main },
              { label: "TypeScript", color: G.main },
              { label: "Recharts", color: "#f59e0b" },
              { label: "styled-components", color: "#a855f7" },
              { label: "Python 3.11", color: "#10b981" },
              { label: "pandas / NumPy", color: G.main },
            ].map(t => (
              <Tag key={t.label} $color={t.color}>{t.label}</Tag>
            ))}
          </TagGrid>
        </Section>

        {/* Features */}
        <Section $delay={1.45}>
          <SectionLabel>05 / Features</SectionLabel>
          <SectionTitle>Key Features</SectionTitle>
          {[
            ["CSV Upload & Instant Analysis", "Upload any NSL-KDD formatted CSV and receive per-row predictions with confidence scores, risk levels, and attack categories in seconds."],
            ["Dual Confusion Matrices", "Visualise both the SVM binary confusion matrix (2×2) and the XGBoost 5-class heatmap (5×5) to evaluate model performance transparently."],
            ["Interactive Dashboard", "Real-time charts showing traffic distribution, model comparison bar charts, and per-category breakdowns powered by Recharts."],
            ["History & Reports", "Every analysis session is saved to history with timestamps. Full PDF-ready reports can be generated for sharing and compliance."],
            ["Role-Based Access", "Separate user and admin roles — admins can configure model parameters, view audit logs, and manage sessions from a dedicated panel."],
          ].map(([title, body]) => (
            <div key={title} style={{ marginBottom: "1rem" }}>
              <Body><HighlightWord>▸ {title}:</HighlightWord></Body>
              <Body style={{ marginLeft: "1.25rem", opacity: 0.85 }}>{body}</Body>
            </div>
          ))}
        </Section>

        <FooterCta>
          <Body style={{ marginBottom: "1.5rem", opacity: 0.6 }}>
            Ready to analyse your network traffic?
          </Body>
          <EnterBtn onClick={() => navigate("/login")}>
            ▶ &nbsp; Enter System
          </EnterBtn>
        </FooterCta>
      </ScrollArea>
    </Wrapper>
  )
}
