export async function apiClient<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("accessToken");
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`http://localhost:8080${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }

    return res.json();
}
