"use client"
import { ArrowUpDown, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { Trash, EditIcon } from "lucide-react";
import StatusDropDown from "../StatusDropDown";

export const columns = [
  {
    accessorKey: "busId",
    header: "Bus ID",
  },
  {
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "licensePlate",
    header: "License Plate",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status")

      // Default variant and color
      let variant = "secondary"
      let statusColor = "bg-blue-500 text-white"

      if (status === "active") {
        variant = "success"
        statusColor = "bg-green-100 text-green-800"
      } else if (status === "Inactive") {
        variant = "destructive"
        statusColor = "bg-red-100 text-red-800"
      } else if (status === "Under Maintenance") {
        variant = "warning"
        statusColor = "bg-yellow-100 text-yellow-800"
      }

      return <Badge className={statusColor} variant={variant}>{status}</Badge>
    },

  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "assignedRoutes",
    header: "Assigned Routes",
  },
  {
    accessorKey: "lastMaintenance",
    header: "Last Maintenance",
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const busId = row.getValue("busId");
      const currentStatus = row.getValue("status");

      return (
        <div className="flex gap-2 items-center">
          {/* Update User */}
          <EditIcon
            size={20}
            className="cursor-pointer"
            onClick={() => handleUpdateUser(busId)}
          />

          {/* Change Status Dropdown */}
          <StatusDropDown
            busId={busId}
            initialStatus={currentStatus}
            // onStatusChange={handleStatusUpdate}
          />

          {/* Delete User */}
          <Trash
            size={20}
            className="text-red-600 hover:text-red-800 cursor-pointer"
            onClick={() => handleDeleteUser(busId)}
          />
        </div>
      );
    },
  }
];
