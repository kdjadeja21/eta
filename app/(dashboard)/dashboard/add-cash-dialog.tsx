"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { expenseService } from "@/lib/expense-service";

const formSchema = z.object({
  date: z.date(),
  amount: z.coerce.number().positive("Amount must be positive"),
  bank: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const AddCashDialog = ({
  open,
  onOpenChange,
  onCashAdded,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCashAdded: () => void;
  onClose: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const userId = user?.id;
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(), // Set today's date as default
      amount: 0,
      bank: "",
    },
  });

  const handleAddCash = async ({
    amount,
    desc,
  }: {
    amount: number;
    desc?: string;
  }) => {
    if (userId) {
      await expenseService.addCashTransaction(userId, amount, desc);
      // onClose(); // Close the dialog after adding
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      // Use handleAddCash to add the cash transaction
      await handleAddCash({ amount: values.amount, desc: values.bank });

      onCashAdded();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error adding cash:", error);
      alert("Failed to add cash. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-5 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Cash</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(field.value, "MMM dd, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        toDate={new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                className="w-auto cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Cash"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
