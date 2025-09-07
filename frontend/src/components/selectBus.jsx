"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

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

const busModels = [
  {
    value: "volvo-9400",
    label: "Volvo 9400",
  },
  {
    value: "volvo-b9r",
    label: "Volvo B9R",
  },
  {
    value: "ashok-leyland-xl",
    label: "Ashok Leyland XL",
  },
  {
    value: "tata-marcopolo",
    label: "Tata Marcopolo",
  },
  {
    value: "scania-metrolink",
    label: "Scania Metrolink",
  },
  {
    value: "mercedes-benz-oc500",
    label: "Mercedes-Benz OC 500",
  },
]


export function SelectBus({model, setModel}) {
  const [open, setOpen] = React.useState(false)


  return (
    <Popover className='w-full' open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[400px] justify-between"
        >
          {model
            ? busModels.find((bus) => bus.value === model)?.label
            : "Select Bus"}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search Bus..." />
          <CommandList>
            <CommandEmpty>No Bus found.</CommandEmpty>
            <CommandGroup>
              {busModels.map((bus) => (
                <CommandItem
                  key={bus.value}
                  value={bus.value}
                  onSelect={(currentValue) => {
                    setModel(currentValue === model ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      model === bus.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {bus.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}