import { Link, createFileRoute } from '@tanstack/react-router'
import { getItemById } from '../../../api/queries.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { formatDate, calculateAge, isFutureDate } from '../../../utils/dateUtils.ts'


export const Route = createFileRoute('/_authenticated/fighters/$fighterId')({
  component: FighterPage,
  loader: async ({ params: { fighterId }, context: { queryClient } }) => {
    await queryClient.prefetchQuery({
      queryKey: ['fighters', fighterId],
      queryFn: () => getItemById(fighterId, "fighters")
    });
  },
  pendingComponent: () => <div>Loading...</div>,
  errorComponent: () => <div>Error fetching fighters</div>,
})

function FighterPage() {
  const { fighterId } = Route.useParams();

  const {data: fighter} = useSuspenseQuery({
    queryKey: ['fighters', fighterId],
    queryFn: () => getItemById(fighterId, "fighters")
  });

  // console.log(fighter.data);
  
  function convertInchestoFeetAndInches(heightIn: number): string {
    const feet = Math.floor(heightIn / 12);
    const inches = heightIn % 12;
    return `${feet}'${inches}"`;
  }

  return (
    <div className="w-full mt-2 items-center bg-gray-100 min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-5">{fighter.data.name} {fighter.data?.nickname && <span className="italic">"{fighter.data?.nickname}"</span>}</h1>
      <div className="grid grid-cols-3 mb-5">
        <div className="col-span-1 flex flex-col">
          <span className="font-semibold">Record:</span>
          <span>{fighter.data.wins}-{fighter.data.losses}-{fighter.data.draws}</span>
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="font-semibold">Height:</span>
          {fighter.data.height_in ? (<span>{convertInchestoFeetAndInches(fighter.data.height_in)}</span>) : (<span>N/A</span>)}
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="font-semibold">Weight:</span>
          <span>{fighter.data.weight_lb} lbs</span>
        </div>
        <div className="col-span-1 flex flex-col"></div>
        <div className="col-span-1 flex flex-col"></div>
      </div>
      <div className="grid grid-cols-3 mb-11">
        <div className="col-span-1 flex flex-col">
          <span className="font-semibold">Stance:</span>
          {fighter.data.stance ? <span>{fighter.data.stance}</span> : <span>N/A</span>}
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="font-semibold">Age:</span>
          {fighter.data.date_of_birth ? (
            <>
              <span>{calculateAge(fighter.data.date_of_birth)} years old</span>
              <span>(Born {formatDate(fighter.data.date_of_birth)})</span>
            </>
          ) : (
            <span>N/A</span>
          )}
        </div>
        <div className="col-span-1 flex flex-col">
          <span className="font-semibold">Reach:</span>
          <span>{fighter.data.reach_in ? `${fighter.data.reach_in} inches` : 'N/A'}</span>
        </div>
        <div className="col-span-1 flex flex-col"></div>
        <div className="col-span-1 flex flex-col"></div>
      </div>

      {fighter.data?.participated_bouts && fighter.data?.participated_bouts.length > 0 && (
        isFutureDate(fighter.data?.participated_bouts[0].event.date) && (
          <div className="bg-gray-200 p-4 rounded mb-6">
            <p className="text-lg font-semibold">Upcoming Bout:</p>
            <p className="text-md text-blue-500 hover:underline"><Link to={`/events/${fighter.data?.participated_bouts[0].event.event_id}`}>{fighter.data?.participated_bouts[0].event.name}, {formatDate(fighter.data?.participated_bouts[0].event.date)}</Link></p>
            <span className="mt-6 font-semibold">Opponent: </span>
            <p className="font-semibold">{(fighter.data?.participated_bouts[0].fighter_1.fighter_id === fighter.data.fighter_id) ? <Link className="text-blue-500 hover:underline" to={`/fighters/${fighter.data?.participated_bouts[0].fighter_2.fighter_id}`}>{fighter.data?.participated_bouts[0].fighter_2.name}</Link> : <Link className="text-blue-500 hover:underline" to={`/fighters/${fighter.data?.participated_bouts[0].fighter_1.fighter_id}`}>{fighter.data?.participated_bouts[0].fighter_1.name}</Link>}</p>
          </div>
        )
      )}

      <h1 className="text-3xl mb-5">Bout History</h1>
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Opponent</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Event</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Method</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Round</th>
              <th className="py-3 px-4 border-b text-center text-sm font-semibold text-gray-600">Time</th>

            </tr>
          </thead>
          {fighter.data?.participated_bouts && fighter.data?.participated_bouts.length > 0 ? (
            <tbody>
              {fighter.data?.participated_bouts.map((bout) => {
                if (!isFutureDate(bout.event.date)) {
                  return (
                    <tr key={bout.bout_id} className="border-b border-gray-200">
                      <td className="col-span-1 text-center font-semibold">
                        {bout.winning_fighter ? 
                            (fighter.data.fighter_id === bout.winning_fighter.fighter_id) ? (
                              <span className="inline-block bg-green-500 rounded-full text-white w-5 h-5 relative translate-y-1 mr-3"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">W</span></span>
                            ) : (
                              <span className="inline-block bg-red-500 rounded-full text-white w-5 h-5 relative translate-y-1 mr-3"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">L</span></span>
                            )
                        : (<span className="block bg-blue-500 uppercase">{bout.method}</span>)
                        }
                        {(bout.fighter_1.fighter_id === fighter.data.fighter_id) ? <Link className="text-blue-500 hover:underline" to={`/fighters/${bout.fighter_2.fighter_id}`}>{bout.fighter_2.name}</Link> : <Link className="text-blue-500 hover:underline" to={`/fighters/${bout.fighter_1.fighter_id}`}>{bout.fighter_1.name}</Link>}
                      </td>
                      <td className="col-span-1 text-center"><Link className="text-blue-500 hover:underline" to={`/events/${bout.event.event_id}`}>{bout.event.name}</Link></td>
                      <td className="col-span-1 text-center flex flex-col">
                        <span className="text-lg">{bout.method}</span>
                        {bout.details && <span>{bout.details}</span>}
                        {bout.referee && <span className="text-sm">Referee: {bout.referee}</span>}
                      </td>
                      <td className="col-span-1 text-center">{bout.ending_round}</td>
                      <td className="col-span-1 text-center">{bout.ending_time}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  No upcoming events found.
                </td>
              </tr>
            </tbody>
          )}
        </table>

    </div>
  );
}
