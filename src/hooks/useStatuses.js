import { useCallback, useEffect, useState } from "react";
import { statusesApi } from "../api/statuses.api.js";

export const useStatuses = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await statusesApi.list();
      setGroups(res.data.groups || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const postStatus = useCallback(
    async (payload) => {
      await statusesApi.create(payload);
      await refresh();
    },
    [refresh],
  );

  const markViewed = useCallback(
    (id) => statusesApi.markViewed(id).catch(() => {}),
    [],
  );

  return { groups, loading, refresh, postStatus, markViewed };
};
