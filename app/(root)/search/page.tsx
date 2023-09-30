import UserCard from "@/components/cards/UserCard"
import ProfileHeader from "@/components/shared/ProfileHeader"
import ThreadsTab from "@/components/shared/ThreadsTab"

import { profileTabs } from "@/constants"
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs"
import Image from "next/image"
import { redirect } from "next/navigation"

const Page = async () => {
  const user = await currentUser()
  if (!user) return null

  const userInfo = await fetchUser(user.id)
  if (!userInfo?.onboarded) redirect('/onboarding')

  const results = await fetchUsers({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 25
  })

  return (
    <section>
      <h1 className="head-text mb-1">
        Search
      </h1>

      {/* Search bar */}

      <div className="mt-14 flex flex-col gap-9">
        {results.users.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
            {results.users.map(user => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                imgUrl={user.image}
                personType='User'
              />
            ))}
          </>
        )}
      </div>
    </section>
  )
}

export default Page