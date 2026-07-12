import { type SimulationFormData, type SimulationRecord } from '@/data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = { ...formData, id, createdAt: new Date().toISOString() }

    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...savedData, record]))

    return id
  }

  const getAllFormData = () => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    return [...savedData].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bTime - aTime
    })
  }

  const getFormData = (id: string) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!storage) {
      return null
    }

    const savedData = JSON.parse(storage) as SimulationRecord[]
    return savedData.find((record) => record.id === id) || null
  }

  const deleteSimulation = (id: string) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    const updated = savedData.filter((record) => record.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    const updated = savedData.map((record) => (record.id === id ? { ...data } : record))

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  return { saveFormData, getAllFormData, getFormData, deleteSimulation, updateSimulation }
}
