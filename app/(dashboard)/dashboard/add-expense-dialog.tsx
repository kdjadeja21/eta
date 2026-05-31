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
} from "@/components/ui/sheet";
import { ExpenseType, formatExpenseType } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-is-mobile";

const FORM_ID = "add-expense-form";

const formSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount is required",
    })
    .min(0.01, "Amount must be greater than zero")
    .positive("Amount must be positive"),
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  type: z.nativeEnum(ExpenseType),
  category: z.string(),
  paidBy: z.string(),
  subcategory: z.string(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  expense?: Expense | null;
  userId: string;
  defaultDate?: Date;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  onSubmit,
  expense,
  userId,
  defaultDate,
}: AddExpenseDialogProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      amount: undefined,
      description: "",
      paidBy: "",
      category: "",
      subcategory: "",
      tags: [],
      type: ExpenseType.Need,
    },
  });

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
    if (!open) return;

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
        date: defaultDate ?? new Date(),
        amount: undefined,
        description: "",
        paidBy: "",
        category: "",
        subcategory: "",
        tags: [],
        type: ExpenseType.Need,
      });
    }
  }, [expense, form, open, defaultDate]);

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

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  const selectedCategory = form.watch("category");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "gap-0 p-0",
          isMobile
            ? "max-h-[92dvh] pb-[env(safe-area-inset-bottom)] flex flex-col"
            : "flex flex-col overflow-y-auto"
        )}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex shrink-0 justify-center pb-2 pt-3">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
          </div>
        )}

        {/* Header */}
        <SheetHeader
          className={cn(
            "shrink-0 px-5",
            isMobile ? "border-b pb-4 pt-1" : "pt-5 pb-4 pr-10"
          )}
        >
          <SheetTitle className="text-lg">
            {expense ? "Edit Expense" : "Add Expense"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {expense
              ? "Update the expense details below."
              : "Enter the expense details below."}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable form body */}
        <div
          className={cn(
            "px-5",
            isMobile ? "flex-1 overflow-y-auto py-5" : "py-4"
          )}
        >
          <Form {...form}>
            <form
              id={FORM_ID}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Amount — prominent on mobile */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus={!isMobile}
                        type="number"
                        placeholder="0.00"
                        className={cn(isMobile && "h-12 text-base")}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={
                          field.value === undefined || Number.isNaN(field.value)
                            ? ""
                            : field.value
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            field.onChange(undefined);
                            return;
                          }
                          const parsed = parseFloat(raw);
                          field.onChange(Number.isNaN(parsed) ? undefined : parsed);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
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
                            variant="outline"
                            className={cn(
                              "w-full justify-start pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              isMobile && "h-12 text-base"
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
                      <PopoverContent
                        className="w-auto p-0"
                        align={isMobile ? "center" : "start"}
                        side={isMobile ? "bottom" : "bottom"}
                      >
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

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description"
                        className={cn(
                          "resize-none",
                          isMobile && "text-base min-h-[80px]"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
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
                        <SelectTrigger
                          className={cn("w-full", isMobile && "h-12 text-base")}
                        >
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

              {/* Advanced Details */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value="advanced-details"
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="font-medium text-sm">
                        Advanced Details
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4 px-4 pb-2">
                      <FormField
                        control={form.control}
                        name="paidBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                              <CustomCreatableSelect
                                isClearable
                                menuPlacement="auto"
                                onChange={(option: any) =>
                                  field.onChange(option?.value ?? "")
                                }
                                value={
                                  field.value
                                    ? {
                                        label: field.value,
                                        value: field.value,
                                      }
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
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <CustomCreatableSelect
                                isClearable
                                menuPlacement="auto"
                                onChange={(option: any) =>
                                  field.onChange(option?.value ?? "")
                                }
                                value={
                                  field.value
                                    ? {
                                        label: field.value,
                                        value: field.value,
                                      }
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
                                menuPlacement="auto"
                                onChange={(option: any) =>
                                  field.onChange(option?.value ?? "")
                                }
                                value={
                                  field.value
                                    ? {
                                        label: field.value,
                                        value: field.value,
                                      }
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
                                menuPlacement="top"
                                onChange={(options: any) =>
                                  field.onChange(
                                    options
                                      ? options.map(
                                          (option: any) => option.value
                                        )
                                      : []
                                  )
                                }
                                value={(field.value || []).map((tag) => ({
                                  label: tag,
                                  value: tag,
                                }))}
                                options={getTagOptions(records)}
                                placeholder="Enter tags"
                              />
                            </FormControl>
                            <FormDescription>
                              E.g., &ldquo;groceries, monthly, essential&rdquo;
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </Form>
        </div>

        {/* Footer — always anchored at bottom */}
        <div
          className={cn(
            "shrink-0 border-t px-5",
            isMobile ? "py-4 flex flex-row gap-3" : "py-4 flex flex-row-reverse gap-3"
          )}
        >
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className={cn("cursor-pointer", isMobile && "flex-1 h-12 text-base")}
          >
            {isSubmitting ? "Saving…" : expense ? "Update" : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className={cn("cursor-pointer", isMobile && "flex-1 h-12 text-base")}
          >
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
