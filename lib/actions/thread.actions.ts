"use server"

import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

export async function createThread({ text, author, communityId, path }: Params) {
    try {
        await connectToDB()

        const createdThread = await Thread.create({
            text,
            author,
            community: null
        })

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })

        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    await connectToDB();

    /*
    The line `const skipAmount = (pageNumber - 1) * pageSize` is calculating the number of documents to skip in the database query. 
    */
    const skipAmount = (pageNumber - 1) * pageSize


    /* 
    `threadsQuery` is a query object that is used to fetch threads from the database. It is using the `Thread` model to find threads where the `parentId` is either `null` or `undefined`. 
    It then sorts the threads in descending order based on the `createdAt` field.
    The `skip` method is used to skip a certain number of documents based on the `skipAmount` variable, which is calculated using the `pageNumber` and `pageSize` parameters. 
    The `limit` method is used to limit the number of threads returned to the `pageSize`. 
    The `populate` method is used to populate the `author` field of each thread with the corresponding `User` model.
    Additionally, the `children` field of each thread is populated with the corresponding `User` model, selecting only the `_id`, `name`, `parentId`, and `image` fields. 
    */
    const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'asc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: '_id name parentId image'
            }
        })


    /* 
    `const totalThreadsCount = await Thread.countDocuments({ parentId: { : [null, undefined] } })` is counting the total number of documents in the `Thread` collection where the `parentId` is either `null` or `undefined`. 
    */
    const totalThreadsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } })


    /* 
    `const threads = await threadsQuery.exec()` is executing the query defined by `threadsQuery` and returning the result.
    */
    const threads = await threadsQuery.exec()


    /* 
    The line `const isNext = totalThreadsCount > skipAmount + threads.length` is checking if there are more threads available to fetch in the next page.
    */
    const isNext = totalThreadsCount > skipAmount + threads.length

    return { threads, isNext }
}

export async function fetchThreadById(id: string) {
    connectToDB()

    try {
        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: "_id id name image"
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: '_id name parentId image'
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: '_id id name parentId image'
                        }
                    }
                ]
            }).exec()

        return thread
    } catch (error: any) {
        throw new Error(`Error fetching thread ${error.message}`)
    }
}

export async function addCommentToThread(
    threadId: string,
    commentContent: string,
    userId: string,
    path: string
) {
    connectToDB()

    try {
        const originalThread = await Thread.findById(threadId)

        if (!originalThread) throw new Error('Thread not found')

        const commentThread = new Thread({
            text: commentContent,
            author: userId,
            parentId: threadId
        })

        const savedCommentThread = await commentThread.save()

        originalThread.children.push(savedCommentThread._id)

        await originalThread.save()

        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error adding comment to thread ${error.message}`)
    }
}