"use client"
 
import React from "react"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { DiseaseLocation } from "@/models/disease-warning"
 
interface LocationFormProps {
  location?: DiseaseLocation
}
 
export const LocationForm: React.FC<LocationFormProps> = ({
  location,
}) => {
  const form = useForm({
    defaultValues: {
      name: location?.name || "Vị trí chưa được xác định...",
    },
  })
 
  // Cập nhật giá trị khi location prop thay đổi
  React.useEffect(() => {
    if (location) {
      form.reset({ name: location.name })
    }
  }, [location, form])
 
  return (
    <Card className="mb-6 overflow-hidden border-emerald-100 shadow-sm">
      <CardContent className="p-4">
        <Form {...form}>
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full text-start">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
                      <MapPin className="h-3 w-3" /> Vị trí ruộng lúa (Đã cố định)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        readOnly
                        className="h-10 border-emerald-100 bg-emerald-50/30 font-medium text-emerald-900 cursor-default focus-visible:ring-0"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}
