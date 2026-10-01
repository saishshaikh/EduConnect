import React, { useContext } from "react";
import {
  IoPeopleOutline,
  IoSchoolOutline,
  IoDocumentTextOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { userDataContext } from "../context/UserContext";

export default function EducationStatsSection({ totalUsersCount = 0 }) {
  const { userData, postData } = useContext(userDataContext);

  const postsCount = postData?.length || 0;
  const connectionsCount = userData?.connection?.length || 0;
  const displayUsersCount = Math.max(totalUsersCount, (userData?.connection?.length || 0) + 1);

  const stats = [
    {
      id: "students",
      label: "Active Scholars",
      value: `${displayUsersCount > 0 ? displayUsersCount : "10"}+`,
      desc: "Students & researchers learning together",
      icon: IoPeopleOutline,
      color: "text-[#0066ff] bg-blue-50 dark:bg-blue-950/40",
    },
    {
      id: "professors",
      label: "Educators & Mentors",
      value: "100%",
      desc: "Peer-reviewed insights & academic guidance",
      icon: IoSchoolOutline,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      id: "discussions",
      label: "Academic Posts",
      value: `${postsCount > 0 ? postsCount : "25"}+`,
      desc: "Discussions, projects & questions shared",
      icon: IoDocumentTextOutline,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      id: "connections",
      label: "Your Connections",
      value: `${connectionsCount}`,
      desc: "Peers in your academic network",
      icon: IoSparklesOutline,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white dark:bg-[#121212] rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-[#262626] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Live
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">
                  {stat.label}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-snug hidden sm:block">
                  {stat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
