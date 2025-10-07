"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [lightness, setLightness] = useState(50)

  // Converter HSL para HEX
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  // Converter HEX para HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  // Inicializar valores do HSL baseado na cor atual
  useEffect(() => {
    if (value && value.startsWith('#')) {
      const hsl = hexToHsl(value)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
    }
  }, [value])


  // Função para desenhar o círculo de cores
  const drawColorWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 200
    canvas.width = size
    canvas.height = size
    const centerX = size / 2
    const centerY = size / 2
    const radius = 80

    // Limpar canvas
    ctx.clearRect(0, 0, size, size)

    // Desenhar círculo de matiz
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180
      const endAngle = angle * Math.PI / 180
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.lineWidth = 20
      ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`
      ctx.stroke()
    }

    // Desenhar círculo interno (saturação/brilho)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius - 30)
    gradient.addColorStop(0, 'white')
    gradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`)
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 30, 0, 2 * Math.PI)
    ctx.fillStyle = gradient
    ctx.fill()
  }

  // Desenhar o círculo de cores
  useEffect(() => {
    drawColorWheel()
  }, [hue])

  // Desenhar quando o componente monta
  useEffect(() => {
    const timer = setTimeout(() => {
      drawColorWheel()
    }, 50)
    
    return () => clearTimeout(timer)
  }, [])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    const dx = x - centerX
    const dy = y - centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const normalizedAngle = (angle + 360) % 360

    if (distance > 60 && distance < 100) {
      // Círculo externo (matiz)
      setHue(normalizedAngle)
    } else if (distance <= 60) {
      // Círculo interno (saturação/brilho)
      const saturation = Math.min(100, Math.max(0, (distance / 60) * 100))
      const lightness = Math.min(100, Math.max(0, 100 - (distance / 60) * 100))
      setSaturation(saturation)
      setLightness(lightness)
    }

    const newColor = hslToHex(hue, saturation, lightness)
    onChange(newColor)
  }

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleHexChange = (hex: string) => {
    if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
      onChange(hex)
    }
  }

  const currentColor = hslToHex(hue, saturation, lightness)

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (open) {
          // Forçar re-render do canvas quando o popover abrir
          setTimeout(() => {
            drawColorWheel()
          }, 100)
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: currentColor }}
            />
            {currentColor.toUpperCase()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="border rounded cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={(e) => {
                  if (isDragging) {
                    handleCanvasClick(e)
                  }
                }}
                onClick={handleCanvasClick}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="w-16 text-sm">HEX:</Label>
                <Input
                  value={currentColor}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <Label className="text-xs">Matiz</Label>
                  <Input
                    type="number"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => {
                      const newHue = parseInt(e.target.value) || 0
                      setHue(newHue)
                      onChange(hslToHex(newHue, saturation, lightness))
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Saturação</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={saturation}
                    onChange={(e) => {
                      const newSaturation = parseInt(e.target.value) || 0
                      setSaturation(newSaturation)
                      onChange(hslToHex(hue, newSaturation, lightness))
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">Brilho</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={lightness}
                    onChange={(e) => {
                      const newLightness = parseInt(e.target.value) || 0
                      setLightness(newLightness)
                      onChange(hslToHex(hue, saturation, newLightness))
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
