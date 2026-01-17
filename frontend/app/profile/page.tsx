"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(20, {
      message: "Username must not exceed 20 characters.",
    }),
  bio: z
    .string()
    .max(20, {
      message: "Bio must not exceed 20 characters.",
    })
    .optional(),
  profileImageUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
});

const EditProfileForm = ({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "staks.near",
      bio: "Man of Steal",
      profileImageUrl: "https://example.com/image.jpg",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // TODO: Handle form submission (API call to update profile)
    setIsEditing(false);
  }

  return (
    <div className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormDescription>
                  Your public display name (max 20 characters).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A short bio about yourself (max 20 characters).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profileImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter a URL for your profile image.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full border-green-500 border-dashed font-sans"
            variant="outline"
          >
            Save Changes
          </Button>
        </form>
      </Form>
      <Button
        className="mt-4 w-full bg-green-500/50 text-white  font-sans"
        variant="default"
        onClick={() => setIsEditing(false)}
      >
        Cancel
      </Button>
    </div>
  );
};
function ProfilePage() {
  const [isEditing, setIsEditing] = React.useState(false);
  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto my-0 flex items-center justify-center h-screen w-screen px-2">
      {isEditing ? (
        <EditProfileForm setIsEditing={setIsEditing} />
      ) : (
        <div className="text-center mx-2 md:min-w-md min-w-sm border-dashed border p-8 flex flex-col items-center justify-center">
          <h1 className="text-base font-bold font-sans">Edit Profile</h1>
          <div className="mt-4 w-24 flex items-center justify-center border border-dashed p-1 border-muted-foreground/50">
            <Image
              src="/staks.jpeg"
              alt="Profile Image"
              width={100}
              height={100}
              className="w-24 h-24 object-cover"
            />
          </div>
          <div className="mt-4">
            <div className="flex flex-col">
              <p className="text-muted-foreground font-sans text-xs">
                Display Name
              </p>
              <p className="text-sm font-semibold flex items-center">
                <span className="text-green-500">#</span>
                staks.near
              </p>
            </div>
            <div className="flex flex-col mt-4 ">
              <p className="text-muted-foreground font-sans text-xs">Spent</p>
              <p className="text-sm font-semibold flex items-center gap-1">
                <span className="text-green-500">55</span>
                USDC.e
              </p>
            </div>
            <div className="flex flex-col mt-4">
              <p className="text-muted-foreground font-sans text-xs">Wallet</p>
              <p className="text-xs text-center text-green-600 font-semibold flex items-center">
                0x1234...abcd
              </p>
            </div>
            <div className="flex flex-col mt-4">
              <p className="text-muted-foreground font-sans text-xs">Bio</p>
              <p className="text-xs text-center font-semibold flex items-center">
                Man of Steal
              </p>
            </div>
          </div>
          <Button
            className="mt-8 w-full md:w-1/2 border-green-500 border-dashed font-sans"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
          <Button
            className="mt-4 w-full bg-green-500/80 text-white  font-sans"
            variant="default"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
