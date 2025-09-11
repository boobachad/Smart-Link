"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import axios from "axios"

export function SelectDriver({ driver, setDriver }) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [drivers, setDrivers] = React.useState([]) // Changed from {} to []
  const [allDrivers, setAllDrivers] = React.useState([]) // Store all drivers for filtering
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const fetchDrivers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("userAuth")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const res = await axios.get(`http://localhost:5000/api/drivers/status/active`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      })

      if (!res.data) {
        throw new Error("Invalid response from server")
      }

      console.log("Driver list", res.data)
      
      // Handle different response structures
      let driversList = [];
      if (Array.isArray(res.data)) {
        driversList = res.data;
      } else if (res.data.drivers && Array.isArray(res.data.drivers)) {
        driversList = res.data.drivers;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        driversList = res.data.data;
      } else {
        console.warn("Unexpected response structure:", res.data);
        driversList = [];
      }

      setAllDrivers(driversList);
      setDrivers(driversList);
      
    } catch (err) {
      console.error("Error fetching drivers:", err)
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.")
      } else if (err.response?.status === 403) {
        setError("You don't have permission to access drivers.")
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please try again.")
      } else if (err.message.includes('Network Error')) {
        setError("Network error. Please check your connection.")
      } else {
        setError(err.message || "Failed to fetch drivers. Please try again.")
      }
      
      setDrivers([])
      setAllDrivers([])
    } finally {
      setLoading(false)
    }
  }

  // Filter drivers based on search
  const filterDrivers = React.useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setDrivers(allDrivers);
      return;
    }

    const filtered = allDrivers.filter(driver => 
      driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone?.includes(searchQuery)
    );
    
    setDrivers(filtered);
  }, [allDrivers]);

  // Initial load when component mounts
  React.useEffect(() => {
    fetchDrivers()
  }, [])

  // Filter drivers when search changes with debounce
  React.useEffect(() => {
    const delay = setTimeout(() => {
      filterDrivers(search)
    }, 300)
    
    return () => clearTimeout(delay)
  }, [search, filterDrivers])

  // Retry function for error handling
  const handleRetry = () => {
    fetchDrivers()
  }

  // Get selected driver name
  const selectedDriverName = driver 
    ? allDrivers.find((d) => d._id === driver)?.name 
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] justify-between"
          disabled={error && !drivers.length}
        >
          {/* Show driver name if selected, otherwise placeholder */}
          {selectedDriverName || "Select Driver"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search driver..."
            value={search}
            onValueChange={setSearch}
            disabled={loading && !allDrivers.length}
          />
          
          <CommandList className="max-h-60 overflow-auto">
            {error && !allDrivers.length ? (
              <div className="p-4 text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={loading}
                >
                  {loading ? "Retrying..." : "Retry"}
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {loading ? "Loading drivers..." : "No drivers found."}
                </CommandEmpty>
                
                <CommandGroup>
                  {drivers.length > 0 && drivers.map((d) => (
                    <CommandItem
                      key={d._id}
                      value={d._id}
                      onSelect={() => {
                        setDriver(d._id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          driver === d._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{d.name}</span>
                        {d.phone && (
                          <span className="text-xs text-muted-foreground">
                            {d.phone}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                  
                  {loading && (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      Loading drivers...
                    </div>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}