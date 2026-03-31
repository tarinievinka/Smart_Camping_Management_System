useEffect(() => {
    const fetchGuide = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/guides/update/${id}`);
            const g = res.data;

            // Convert string "English, Sinhala" -> [{value: "English", label: "English"}, ...]
            const formattedLanguages = g.language 
                ? g.language.split(", ").map(lang => ({ value: lang, label: lang }))
                : [];

            setForm({
                ...g,
                language: formattedLanguages,
                experience: g.experience ?? "",
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchGuide();
}, [id]);