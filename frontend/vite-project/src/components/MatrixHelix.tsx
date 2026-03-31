/**
 * Matrix effect within a double helix (DNA) structure.
 *
 * @author SelfMadeSystem (Shoghi Simon) 2024-11-07
 */
import { useEffect, useRef } from "react"
import { isInView, mod, randomInt, randomLog } from "../utils/mathUtils"

export type MatrixColumn = {
  pos: number
  speed: number
  char: string
}

const MatrixHelix = ({
  color = "#00f2ea",
  speed = [0.25, 0.75],
  fontSize = 14,
  lowerOpacity = 0.5,
  upperOpacity = 1,
  helixSpeed = 0.01,
  minWidth = 0.9,
  maxWidth = 450,
  sideOffset = 0.4,
  sideWidth = 0.2,
  sideHeight = 1,
}: {
  color?: string
  speed?: [number, number]
  fontSize?: number
  lowerOpacity?: number
  upperOpacity?: number
  helixSpeed?: number
  minWidth?: number
  maxWidth?: number
  sideOffset?: number
  sideWidth?: number
  sideHeight?: number
  bars?: number
  barWidth?: number
  barSpeed?: number
}) => {
  const canvasLowerRef = useRef<HTMLCanvasElement | null>(null)
  const canvasUpperRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    const columnsArray: MatrixColumn[] = []
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const canvasLower = canvasLowerRef.current
    if (!canvasLower) return
    const ctxLower = canvasLower.getContext("2d")
    if (!ctxLower) return
    const canvasUpper = canvasUpperRef.current
    if (!canvasUpper) return
    const ctxUpper = canvasUpper.getContext("2d")
    if (!ctxUpper) return

    const roundToFontSize = (n: number) => Math.floor(n / fontSize) * fontSize

    const matrixCanvas = new OffscreenCanvas(roundToFontSize(300), roundToFontSize(600))
    const matrixCtx = matrixCanvas.getContext("2d")!

    let width = (canvasUpper.width = canvasLower.width = canvasLower.clientWidth)
    let height = (canvasUpper.height = canvasLower.height = canvasLower.clientHeight)

    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()+-=[]{};:',.<>?/".split("")

    const randSpeed = () => randomLog(...speed)

    const createColumn = () => ({
      pos: randomInt(0, height / fontSize),
      speed: randSpeed(),
      char: chars[randomInt(0, chars.length - 1)],
    })

    const resetColumn = (col: MatrixColumn) => {
      col.char = chars[randomInt(0, chars.length - 1)]
      col.pos = 0
    }

    const drawMatrix = (draw = true) => {
      const w = matrixCanvas.width
      const h = matrixCanvas.height
      const columns = Math.floor(w / fontSize)

      if (columnsArray.length < columns) {
        for (let i = columnsArray.length; i < columns; i++) {
          columnsArray.push(createColumn())
        }
      }

      matrixCtx.fillStyle = "rgba(0, 0, 0, 0.02)"
      matrixCtx.fillRect(0, 0, w, h)
      matrixCtx.fillStyle = color
      matrixCtx.font = `${fontSize}px monospace`

      for (let i = 0; i < columns; i++) {
        const { pos, speed: sp, char } = columnsArray[i]
        if (draw) matrixCtx.fillText(char, i * fontSize, Math.floor(pos) * fontSize)
        if (pos * fontSize > h) resetColumn(columnsArray[i])
        if (Math.floor(pos + sp) > pos) columnsArray[i].char = chars[randomInt(0, chars.length - 1)]
        columnsArray[i].pos += sp
      }
    }

    const helixClip = () => {
      const calculatedWidth = Math.min(width * minWidth, maxWidth)
      const halfW = width / 2
      const sideHeightPx = sideHeight * calculatedWidth
      const sideWidthPx = sideWidth * calculatedWidth
      const sideFromCenterPx = calculatedWidth / 2
      const sideOffsetPx = sideOffset * calculatedWidth
      const repititions = Math.ceil(height / sideHeightPx) + 2
      const offset = ((Date.now() * helixSpeed * height * 0.01) % sideHeightPx) - 1.5 * sideHeightPx

      for (const [ctx, off, s] of [
        [ctxLower, 0, 1],
        [ctxUpper, 0.5, -1],
      ] as const) {
        ctx.beginPath()
        for (let i = 0; i <= repititions; i++) {
          for (let j = 0; j <= sideOffsetPx; j += sideOffsetPx || 1) {
            const y = (i + off) * sideHeightPx + offset + j
            const x1 = halfW - sideFromCenterPx * s
            const y1 = y
            const x2 = x1
            const y2 = y + sideHeightPx / 4
            const x3 = halfW + sideFromCenterPx * s
            const y3 = y2
            const x4 = x3
            const y4 = y + sideHeightPx / 2

            ctx.moveTo(x1, y1)
            ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4)
            ctx.lineTo(x4, y4 + sideWidthPx)
            ctx.bezierCurveTo(x3, y3 + sideWidthPx, x2, y2 + sideWidthPx, x1, y1 + sideWidthPx)
            ctx.closePath()
          }
        }
        ctx.clip("nonzero")
      }
    }

    const drawImage = () => {
      const now = Date.now() * 0.01
      const mWidth = matrixCanvas.width
      const mHeight = matrixCanvas.height
      const horiztonalOffset = 0.002
      const verticalOffset = 0.008

      for (const [ctx, offsetX, offsetY] of [
        [ctxLower, (now * horiztonalOffset * width) % mWidth, (now * verticalOffset * height) % mHeight],
        [ctxUpper, -((now * horiztonalOffset * width) % mWidth), (now * verticalOffset * height) % mHeight],
      ] as const) {
        for (let x = mod(offsetX, mWidth) - mWidth; x < width; x += mWidth) {
          for (let y = mod(offsetY, mHeight) - mHeight; y < height; y += mHeight) {
            ctx.drawImage(matrixCanvas, x, y)
          }
        }
      }
    }

    const draw = () => {
      const inView = isInView(canvasLower)
      drawMatrix(inView)

      if (!inView && !prefersReducedMotion) {
        animationFrameRef.current = requestAnimationFrame(draw)
        return
      }

      for (const ctx of [ctxLower, ctxUpper]) {
        ctx.clearRect(0, 0, width, height)
        ctx.save()
      }

      helixClip()
      drawImage()

      for (const ctx of [ctxLower, ctxUpper]) {
        ctx.restore()
      }

      if (prefersReducedMotion) return
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    const initDraw = () => {
      if (prefersReducedMotion) {
        for (let i = 0; i < matrixCanvas.height / fontSize; i++) drawMatrix()
        if (canvasUpperRef.current) canvasUpperRef.current.style.zIndex = "-1"
        draw()
      } else {
        draw()
      }
    }

    const resize = () => {
      width = canvasUpper.width = canvasLower.width = canvasLower.clientWidth
      height = canvasUpper.height = canvasLower.height = canvasLower.clientHeight
      cancelAnimationFrame(animationFrameRef.current)
      initDraw()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvasLower)
    initDraw()

    return () => {
      cancelAnimationFrame(animationFrameRef.current)
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <canvas
        ref={canvasLowerRef}
        style={{ position: "absolute", zIndex: -1, width: "100%", height: "100%", opacity: lowerOpacity }}
      />
      <canvas
        ref={canvasUpperRef}
        style={{ position: "absolute", zIndex: -1, width: "100%", height: "100%", opacity: upperOpacity }}
      />
    </>
  )
}

export default MatrixHelix
