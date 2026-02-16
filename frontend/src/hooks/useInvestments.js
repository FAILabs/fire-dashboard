import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '../lib/constants'

const DEFAULT_DATA = { investments: [], tags: [] }

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVESTMENTS)
    return stored ? JSON.parse(stored) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

export function useInvestments() {
  const [data, setData] = useState(loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVESTMENTS, JSON.stringify(data))
  }, [data])

  const addInvestment = useCallback((investment) => {
    const newInv = {
      ...investment,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setData((prev) => ({
      ...prev,
      investments: [...prev.investments, newInv],
    }))
    return newInv
  }, [])

  const updateInvestment = useCallback((updated) => {
    setData((prev) => ({
      ...prev,
      investments: prev.investments.map((inv) =>
        inv.id === updated.id
          ? { ...inv, ...updated, updatedAt: new Date().toISOString() }
          : inv
      ),
    }))
  }, [])

  const deleteInvestment = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      investments: prev.investments.filter((inv) => inv.id !== id),
    }))
  }, [])

  const addTag = useCallback((tag) => {
    const normalized = tag.trim().toLowerCase()
    if (!normalized) return
    setData((prev) => ({
      ...prev,
      tags: prev.tags.includes(normalized) ? prev.tags : [...prev.tags, normalized],
    }))
  }, [])

  const removeTag = useCallback((tag) => {
    setData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
      investments: prev.investments.map((inv) => ({
        ...inv,
        tags: inv.tags.filter((t) => t !== tag),
      })),
    }))
  }, [])

  const importData = useCallback((jsonData) => {
    if (jsonData && Array.isArray(jsonData.investments)) {
      setData({
        investments: jsonData.investments,
        tags: jsonData.tags || [],
      })
    }
  }, [])

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2)
  }, [data])

  return {
    investments: data.investments,
    tags: data.tags,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addTag,
    removeTag,
    importData,
    exportData,
  }
}
