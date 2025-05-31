"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Expense, expenseService } from "@/lib/expense-service";
import CustomCreatableSelect from "@/components/CustomCreatableSelect";
import {
  getPaidByOptions,
  getCategoryOptions,
  getSubcategoryOptions,
  getTagOptions,
} from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ExpenseType, formatExpenseType } from "@/lib/types";

const formSchema = z.object({
  amount: z.number().min(0, "Amount must be positive"),
  type: z.nativeEnum(ExpenseType),
  date: z.date(),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  paidBy: z.string().min(1, "Payment Method is required"),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  expense?: Expense | null;
  userId: string;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onSubmit,
  expense,
  userId,
}: AddExpenseDialogProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      description: "",
      paidBy: "",
      category: "",
      subcategory: "",
      tags: [],
      type: ExpenseType.Need,
    },
  });

  // Determine which service to use based on userId
  const service = expenseService;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await service.getExpenses(userId);
        setRecords(data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    if (open) {
      fetchRecords();
    }
  }, [userId, open, service]);

  useEffect(() => {
    if (expense) {
      form.reset({
        date: expense.date,
        amount: expense.amount,
        description: expense.description,
        paidBy: expense.paidBy,
        category: expense.category,
        subcategory: expense.subcategory,
        tags: expense.tags || [],
        type: expense.type,
      });
    } else {
      form.reset({
        date: new Date(),
        amount: 0,
        description: "",
        paidBy: "",
        category: "",
        subcategory: "",
        tags: [],
        type: ExpenseType.Need,
      });
    }
  }, [expense, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = form.watch("category");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-5 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{expense ? "Edit Expense" : "Add Expense"}</SheetTitle>
          <SheetDescription>
            {expense
              ? "Update the expense details below."
              : "Enter the expense details below."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          value={field.value}
                          onChange={field.onChange}
                          disableFutureDates
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
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter a description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <CustomCreatableSelect
                        isClearable
                        onChange={(option: any) =>
                          field.onChange(option?.value || "")
                        }
                        value={
                          field.value
                            ? { label: field.value, value: field.value }
                            : null
                        }
                        options={getPaidByOptions(records)}
                        placeholder="Payment method"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ExpenseType.Need}>
                          {formatExpenseType(ExpenseType.Need)}
                        </SelectItem>
                        <SelectItem value={ExpenseType.Want}>
                          {formatExpenseType(ExpenseType.Want)}
                        </SelectItem>
                        <SelectItem value={ExpenseType.NotSure}>
                          {formatExpenseType(ExpenseType.NotSure)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CustomCreatableSelect
                        isClearable
                        onChange={(option: any) =>
                          field.onChange(option?.value || "")
                        }
                        value={
                          field.value
                            ? { label: field.value, value: field.value }
                            : null
                        }
                        options={getCategoryOptions(records)}
                        placeholder="Select a category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <CustomCreatableSelect
                        isClearable
                        onChange={(option: any) =>
                          field.onChange(option?.value || "")
                        }
                        value={
                          field.value
                            ? { label: field.value, value: field.value }
                            : null
                        }
                        options={getSubcategoryOptions(
                          records,
                          selectedCategory
                        )}
                        placeholder="Select a subcategory"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <CustomCreatableSelect
                      isMulti
                      isClearable
                      onChange={(options: any) =>
                        field.onChange(
                          options
                            ? options.map((option: any) => option.value)
                            : []
                        )
                      }
                      value={(field.value || []).map((tag) => ({
                        label: tag,
                        value: tag,
                      }))}
                      options={getTagOptions(records)}
                      placeholder="Enter tags separated by commas"
                    />
                  </FormControl>
                  <FormDescription>
                    E.g., "groceries, monthly, essential"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : expense ? "Update" : "Add"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
