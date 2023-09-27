"use client"

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from '@/lib/actions/thread.actions';

import { usePathname, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from 'next/image';

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
    const router = useRouter()
    const pathname = usePathname()

    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
        }
    })

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname)

        form.reset()
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="comment-form"
            >
                <FormField control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-3 w-full">
                            <FormLabel>
                                <Image
                                    src={currentUserImg}
                                    alt="Profile image"
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </FormLabel>
                            <FormControl className="border-none bg-transparent">
                                <Input
                                    type="text"
                                    placeholder="What's your thoughts about this thread?"
                                    className='no-focus text-light-1 outline-none'
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button className="comment-form_btn" type="submit">Reply</Button>
            </form>
        </Form>
    )
}

export default Comment